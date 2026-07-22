import { describe, expect, it } from 'vitest';
import { secondsUntilNextUtcDay } from '../src/handlers/votd';

describe('secondsUntilNextUtcDay', () => {
  it('meio-dia UTC → 12h restantes', () => {
    expect(secondsUntilNextUtcDay(new Date('2026-07-21T12:00:00Z'))).toBe(12 * 3600);
  });

  it('perto da virada → TTL curto, nunca menor que 60s', () => {
    expect(secondsUntilNextUtcDay(new Date('2026-07-21T23:50:00Z'))).toBe(600);
    expect(secondsUntilNextUtcDay(new Date('2026-07-21T23:59:59Z'))).toBe(60);
  });

  it('início do dia → quase 24h', () => {
    expect(secondsUntilNextUtcDay(new Date('2026-07-21T00:00:01Z'))).toBe(86399);
  });
});
