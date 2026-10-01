import { describe, expect, it } from 'vitest';
import { licenseOf } from '../src/landing/license';

// Textos reais do catálogo (catalog/versions.json), resumidos.
describe('licenseOf', () => {
  it('domínio público simples', () => {
    expect(licenseOf('King James Version (KJV)\nPublic Domain.\nFirst published in 1611.')).toEqual({ kind: 'pd' });
    expect(licenseOf('Nuova Riveduta (NRI)\nTesto della Riveduta di Giovanni Luzzi (1927), di pubblico dominio.')).toEqual({ kind: 'pd' });
    expect(licenseOf('Open Scriptures Morphological Hebrew (OSMH)\nThis text is released into the public domain.')).toEqual({ kind: 'pd' });
  });

  it('© antigo (LSG 1910) continua domínio público', () => {
    expect(licenseOf('Louis Segond (LSG)\n© 1910.\nPublic Domain.')).toEqual({ kind: 'pd' });
  });

  it('CC0 conta como domínio público', () => {
    expect(licenseOf('World English Bible (WEB)\nPublic Domain (CC0).')).toEqual({ kind: 'pd' });
  });

  it('extrai o rótulo Creative Commons', () => {
    expect(licenseOf('Open Nova Bíblia Viva (ONBV)\n© 2007, 2010 Biblica, Inc.\nLicença Creative Commons Atribuição-CompartilhaIgual 4.0 (CC BY-SA 4.0).')).toEqual({ kind: 'cc', label: 'CC BY-SA 4.0' });
    expect(licenseOf('SBL Greek New Testament (SBLGNT)\nLicensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0).')).toEqual({ kind: 'cc', label: 'CC BY 4.0' });
    expect(licenseOf('Yorumsuz Türkçe Çeviri (YCV)\nCreative Commons Atıf-Türetilemez 4.0 lisansı (CC BY-ND 4.0) ile sunulmuştur.')).toEqual({ kind: 'cc', label: 'CC BY-ND 4.0' });
  });

  it('direitos reservados com permissão ou © recente viram "ver termos"', () => {
    expect(licenseOf('Reina-Valera Gómez 2010 (RVG)\n© 2004, 2010, 2023 Dr. Humberto Gómez Caballero.\nDerechos reservados.')).toEqual({ kind: 'terms' });
    expect(licenseOf('Dansk Bibel 1931 (DAN1931)\nDet Nye Testamente er i offentlig eje (Public Domain).\nDet Gamle Testamente © 1931 Det Danske Bibelselskab.')).toEqual({ kind: 'terms' });
    expect(licenseOf('Sagradas Escrituras 1569 (SEV)\nTraducción de Casiodoro de Reina, dominio público.\nOrtografía actualizada © 1996, 2002 Russell Martin Stendal.')).toEqual({ kind: 'terms' });
  });

  it('copyright ausente vira "ver termos"', () => {
    expect(licenseOf(undefined)).toEqual({ kind: 'terms' });
  });
});
