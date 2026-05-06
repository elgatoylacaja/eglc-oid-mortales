import { describe, it, expect } from 'vitest';
import { formatFollowers, nodeRadius } from './format';

describe('formatFollowers', () => {
  it('formats millions with one decimal', () => {
    expect(formatFollowers(52_915_846)).toBe('52.9M');
  });
  it('formats sub-million as K', () => {
    expect(formatFollowers(440_000)).toBe('440K');
  });
  it('formats small numbers as-is', () => {
    expect(formatFollowers(500)).toBe('500');
  });
  it('rounds correctly at million boundary', () => {
    expect(formatFollowers(1_000_000)).toBe('1.0M');
  });
});

describe('nodeRadius', () => {
  it('returns minimum 2 for zero followers', () => {
    expect(nodeRadius(0)).toBe(2);
  });
  it('clamps to maximum 20', () => {
    expect(nodeRadius(100_000_000_000)).toBe(20);
  });
  it('returns a value in range for typical artist', () => {
    const r = nodeRadius(5_000_000);
    expect(r).toBeGreaterThanOrEqual(2);
    expect(r).toBeLessThanOrEqual(20);
  });
});
