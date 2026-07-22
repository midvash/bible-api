#!/usr/bin/env node
/**
 * Checagem de cobertura catálogo × conteúdo.
 *
 * Para cada versão anunciada em `/versions`, confirma que o conteúdo existe DE
 * VERDADE amostrando o primeiro e o último capítulo de alguns livros âncora
 * (Gênesis, Salmos — AT; Mateus, João, Apocalipse — NT), respeitando
 * `hasOldTestament` / `hasNewTestament`. Uma amostra "passa" se a API responde
 * 200 com um array de versículos não-vazio.
 *
 * Motivação (caso BBE / skd): o catálogo anunciava versões cujo conteúdo NÃO
 * estava no R2 (catálogo dizia 1189 capítulos, R2 tinha zero objetos). Este
 * check pega essa classe de bug antes que um cliente (ex.: o plugin WordPress)
 * a encontre em produção.
 *
 * Uso:
 *   node scripts/check-coverage.mjs
 *   API_BASE=https://api.midvash.com node scripts/check-coverage.mjs
 *   node scripts/check-coverage.mjs --version bbe --version skd   # subconjunto
 *   node scripts/check-coverage.mjs --update-baseline             # regrava baseline
 *
 * Baseline de gaps conhecidos: `scripts/coverage-known-gaps.json` lista lacunas
 * pré-existentes (dívida conhecida) para que o check falhe apenas em REGRESSÕES
 * — uma versão nova sem conteúdo (caso BBE) não está no baseline e derruba o CI.
 * Formato: `{ "<slug>": ["<book>/<chapter>", ...] | "*" }` ("*" = versão toda
 * vazia). Rode com `--update-baseline` para regravar após publicar conteúdo.
 *
 * Saída: relatório por versão + resumo. Exit 1 se houver gap FORA do baseline.
 * Sem dependências: usa só o `fetch` global do Node (≥ 18).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const API_BASE = (process.env.API_BASE ?? 'https://api.midvash.com').replace(/\/+$/, '');
const CONCURRENCY = Number(process.env.COVERAGE_CONCURRENCY ?? 12);
const BASELINE_PATH =
  process.env.COVERAGE_BASELINE ??
  join(dirname(fileURLToPath(import.meta.url)), 'coverage-known-gaps.json');
const UPDATE_BASELINE = process.argv.includes('--update-baseline');

/** Carrega o baseline de gaps conhecidos ({} se ausente/inválido). */
function loadBaseline() {
  try {
    return JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

/** Um gap é "conhecido" se o baseline marca a versão inteira ("*") ou o par. */
function isKnownGap(baseline, slug, book, chapter) {
  const entry = baseline[slug];
  if (!entry) return false;
  if (entry === '*' || (Array.isArray(entry) && entry.includes('*'))) return true;
  return Array.isArray(entry) && entry.includes(`${book}/${chapter}`);
}

// Livros âncora com o total de capítulos (para amostrar primeiro + último).
const ANCHORS = {
  old: [
    { slug: 'genesis', lastChapter: 50 },
    { slug: 'psalms', lastChapter: 150 },
  ],
  new: [
    { slug: 'matthew', lastChapter: 28 },
    { slug: 'john', lastChapter: 21 },
    { slug: 'revelation', lastChapter: 22 },
  ],
};

// Slugs pedidos na linha de comando (--version x --version y); vazio = todos.
const onlyVersions = new Set();
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--version' && process.argv[i + 1]) {
    onlyVersions.add(process.argv[++i].toLowerCase());
  }
}

/** Monta a lista de amostras (version × book × chapter) a checar. */
function buildSamples(version) {
  const books = [
    ...(version.hasOldTestament ? ANCHORS.old : []),
    ...(version.hasNewTestament ? ANCHORS.new : []),
  ];
  const samples = [];
  for (const book of books) {
    // Primeiro e último capítulo — se o livro tem 1 capítulo, não duplica.
    const chapters = book.lastChapter > 1 ? [1, book.lastChapter] : [1];
    for (const chapter of chapters) {
      samples.push({ slug: version.slug, book: book.slug, chapter });
    }
  }
  return samples;
}

/** Checa uma amostra. Retorna { ok, status, reason }. */
async function checkSample(sample) {
  const url = `${API_BASE}/${sample.slug}/${sample.book}/${sample.chapter}`;
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (res.status !== 200) {
      return { ...sample, ok: false, reason: `HTTP ${res.status}` };
    }
    const body = await res.json();
    if (!Array.isArray(body.verses) || body.verses.length === 0) {
      return { ...sample, ok: false, reason: 'sem versículos no corpo' };
    }
    return { ...sample, ok: true };
  } catch (err) {
    return { ...sample, ok: false, reason: `fetch falhou: ${err.message}` };
  }
}

/** Executa `tasks` (thunks) com concorrência limitada, preservando a ordem. */
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function main() {
  console.log(`🔎 Checagem de cobertura contra ${API_BASE}`);

  const res = await fetch(`${API_BASE}/versions`, { headers: { accept: 'application/json' } });
  if (!res.ok) {
    console.error(`❌ Não consegui ler ${API_BASE}/versions (HTTP ${res.status})`);
    process.exit(2);
  }
  let versions = (await res.json()).versions;
  if (!Array.isArray(versions) || versions.length === 0) {
    console.error('❌ Catálogo vazio ou malformado.');
    process.exit(2);
  }
  if (onlyVersions.size > 0) {
    versions = versions.filter((v) => onlyVersions.has(v.slug.toLowerCase()));
  }

  const allSamples = versions.flatMap(buildSamples);
  console.log(`   ${versions.length} versões, ${allSamples.length} amostras (conc=${CONCURRENCY})\n`);

  const checked = await mapLimit(allSamples, CONCURRENCY, checkSample);
  const failures = checked.filter((r) => !r.ok);

  // `--update-baseline`: regrava o arquivo com o estado atual de gaps e sai 0.
  if (UPDATE_BASELINE) {
    const baseline = {};
    for (const f of failures) (baseline[f.slug] ??= []).push(`${f.book}/${f.chapter}`);
    // Versão sem NENHUMA amostra OK vira "*" (dívida total, ex.: skd).
    for (const slug of Object.keys(baseline)) {
      const total = allSamples.filter((s) => s.slug === slug).length;
      if (baseline[slug].length === total) baseline[slug] = '*';
    }
    writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2) + '\n');
    console.log(`📝 Baseline regravado em ${BASELINE_PATH} (${Object.keys(baseline).length} versões).`);
    process.exit(0);
  }

  const baseline = loadBaseline();
  const regressions = failures.filter((f) => !isKnownGap(baseline, f.slug, f.book, f.chapter));
  const known = failures.filter((f) => isKnownGap(baseline, f.slug, f.book, f.chapter));

  if (known.length > 0) {
    const knownSlugs = [...new Set(known.map((f) => f.slug))];
    console.log(`ℹ️  ${known.length} gap(s) conhecido(s) no baseline (ignorados): ${knownSlugs.join(', ')}`);
  }

  if (regressions.length === 0) {
    console.log(`✅ Sem regressões. As ${versions.length} versões cobrem as amostras (fora o baseline).`);
    process.exit(0);
  }

  // Agrupa regressões por versão.
  const byVersion = new Map();
  for (const r of regressions) {
    if (!byVersion.has(r.slug)) byVersion.set(r.slug, []);
    byVersion.get(r.slug).push(r);
  }

  console.error(`\n❌ ${byVersion.size} versão(ões) com conteúdo faltando FORA do baseline:\n`);
  for (const [slug, fails] of byVersion) {
    console.error(`  ${slug}:`);
    for (const f of fails) console.error(`    - ${f.book} ${f.chapter} → ${f.reason}`);
  }
  console.error(
    `\nO catálogo anuncia essas versões mas o R2 não tem (todo) o conteúdo. ` +
      `Publique o conteúdo faltante, remova a versão do catálogo, ou — se for ` +
      `dívida aceita — rode 'node scripts/check-coverage.mjs --update-baseline'.`,
  );
  process.exit(1);
}

main().catch((err) => {
  console.error('❌ Erro inesperado:', err);
  process.exit(2);
});
