import { describe, expect, it } from 'vitest';
import { closestString, normalizeLoose } from '../src/lib/suggest';

describe('normalizeLoose', () => {
  it('remove acentos, pontuação e caixa', () => {
    expect(normalizeLoose('2_Samuel ')).toBe('2samuel');
    expect(normalizeLoose('São-João')).toBe('saojoao');
  });
});

describe('closestString', () => {
  const candidates = ['genesis', 'exodus', 'song-of-solomon'];

  it('acha vizinho a até 2 edições', () => {
    expect(closestString('genesys', candidates)).toBe('genesis');
    expect(closestString('exodos', candidates)).toBe('exodus');
  });

  it('match exato após normalização frouxa vence com distância 0', () => {
    expect(closestString('Song Of Solomon', candidates)).toBe('song-of-solomon');
  });

  it('devolve null quando nada é plausível', () => {
    expect(closestString('apocalipse', candidates)).toBeNull();
    expect(closestString('', candidates)).toBeNull();
  });
});
