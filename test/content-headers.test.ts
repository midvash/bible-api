import { describe, expect, it } from 'vitest';
import { contentHeaders } from '../src/env';
import { versionNotice } from '../src/lib/version-notice';

describe('contentHeaders', () => {
  it('conteúdo da versão pedida é imutável por 1 ano', () => {
    expect(contentHeaders(null)['Cache-Control']).toContain('immutable');
    expect(contentHeaders(null)['Cache-Control']).toContain('max-age=31536000');
  });

  it('versão trocada por alias fica 1 dia, sem immutable', () => {
    expect(contentHeaders(versionNotice('nvi', 'onbv'))['Cache-Control']).toBe('public, max-age=86400, s-maxage=86400');
  });
});
