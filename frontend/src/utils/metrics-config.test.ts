import { describe, it, expect } from 'vitest';
import { computeSize, METRIC_SCALES, NONE_SIZE } from '../metrics-config';

describe('computeSize', () => {
  it('returns minR for a value at domain minimum', () => {
    const cfg = METRIC_SCALES.betweenness;
    expect(computeSize(cfg.domain[0], cfg.scale, cfg.domain, cfg.minR, cfg.maxR)).toBe(cfg.minR);
  });

  it('returns maxR for a value at domain maximum', () => {
    const cfg = METRIC_SCALES.betweenness;
    expect(computeSize(cfg.domain[1], cfg.scale, cfg.domain, cfg.minR, cfg.maxR)).toBeCloseTo(cfg.maxR);
  });

  it('clamps values below domain minimum to minR', () => {
    const cfg = METRIC_SCALES.betweenness;
    expect(computeSize(0, cfg.scale, cfg.domain, cfg.minR, cfg.maxR)).toBe(cfg.minR);
  });

  it('clamps values above domain maximum to maxR', () => {
    const cfg = METRIC_SCALES.popularity;
    expect(computeSize(200, cfg.scale, cfg.domain, cfg.minR, cfg.maxR)).toBeCloseTo(cfg.maxR);
  });

  it('returns a value between minR and maxR for a mid-range value (log scale)', () => {
    const cfg = METRIC_SCALES.followers;
    const result = computeSize(1_000_000, cfg.scale, cfg.domain, cfg.minR, cfg.maxR);
    expect(result).toBeGreaterThan(cfg.minR);
    expect(result).toBeLessThan(cfg.maxR);
  });

  it('returns a value between minR and maxR for a mid-range value (linear scale)', () => {
    const cfg = METRIC_SCALES.popularity;
    const result = computeSize(75, cfg.scale, cfg.domain, cfg.minR, cfg.maxR);
    expect(result).toBeGreaterThan(cfg.minR);
    expect(result).toBeLessThan(cfg.maxR);
  });

  it('none metric always returns minR (which equals maxR)', () => {
    const cfg = METRIC_SCALES.none;
    expect(computeSize(1, cfg.scale, cfg.domain, cfg.minR, cfg.maxR)).toBe(cfg.minR);
  });
});

describe('METRIC_SCALES', () => {
  it('has an entry for every SizeMetric', () => {
    const keys = ['followers', 'popularity', 'betweenness', 'unique_collabs', 'total_collabs', 'none'];
    for (const key of keys) {
      expect(METRIC_SCALES).toHaveProperty(key);
    }
  });

  it('every entry has a valid scale value', () => {
    for (const cfg of Object.values(METRIC_SCALES)) {
      expect(['log', 'linear']).toContain(cfg.scale);
    }
  });

  it('every entry has minR <= maxR', () => {
    for (const cfg of Object.values(METRIC_SCALES)) {
      expect(cfg.minR).toBeLessThanOrEqual(cfg.maxR);
    }
  });
});
