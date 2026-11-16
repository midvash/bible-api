/**
 * Aviso de versão trocada: o cliente pediu uma versão que saiu da API
 * (direitos reservados) e a livre do mesmo idioma respondeu no lugar.
 *
 * A troca continua acontecendo (cliente antigo, como o plugin WordPress com
 * NVT salva, não pode quebrar), mas agora ela é dita: `meta.versionNotice` no
 * envelope v1 e os headers `X-Midvash-Requested-Version` /
 * `X-Midvash-Served-Version` em toda rota de conteúdo, inclusive a legada.
 */

export interface VersionNotice {
  /** Slug que o cliente pediu (minúsculo). */
  requested: string;
  /** Slug que respondeu no lugar. */
  served: string;
  message: string;
}

/** null quando a versão pedida é a que respondeu. */
export function versionNotice(requested: string, served: string): VersionNotice | null {
  if (requested === served) return null;
  return {
    requested,
    served,
    message:
      `Version "${requested}" is not available in this API. ` +
      `Served "${served}", a free version in the same language, instead. ` +
      'See /v1/versions for the full list.',
  };
}

/** Headers do aviso; vazio quando não houve troca. */
export function versionNoticeHeaders(notice: VersionNotice | null): Record<string, string> {
  if (!notice) return {};
  return {
    'X-Midvash-Requested-Version': notice.requested,
    'X-Midvash-Served-Version': notice.served,
    // Sem isso o browser esconde os headers do JS de outra origem (CORS).
    'Access-Control-Expose-Headers': 'X-Midvash-Requested-Version, X-Midvash-Served-Version',
  };
}

/**
 * Pedaço do ETag v1 quando houve troca: o corpo ganhou `meta.versionNotice`,
 * e um ETag igual ao de antes faria o cliente revalidar com 304 e nunca ver o
 * aviso. Vazio sem troca, pra não mexer no ETag do resto.
 */
export function noticeTag(notice: VersionNotice | null): string[] {
  return notice ? ['vn'] : [];
}
