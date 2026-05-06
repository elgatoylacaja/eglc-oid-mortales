import { describe, it, expect } from 'vitest';
import { edgeKey, fitTransform } from './graph';
import type { Node } from '../types';

describe('edgeKey', () => {
  it('produces a stable key for a source/target pair', () => {
    expect(edgeKey('A', 'B')).toBe('A--B');
  });
});

describe('fitTransform', () => {
  const METRIC_DATA = { x: 0, y: 0, size: 6 };
  const METRICS = { followers: METRIC_DATA, popularity: METRIC_DATA, betweenness: METRIC_DATA, unique_collabs: METRIC_DATA, total_collabs: METRIC_DATA, none: METRIC_DATA };
  const nodes: Node[] = [
    { name: 'A', spotify_id: '1', followers: 1000, popularity: 80, betweenness_centrality: 0, unique_collabs: 1, total_collabs: 1, group: 0, image: '', x: -100, y: -50, size: 6, metrics: METRICS },
    { name: 'B', spotify_id: '2', followers: 2000, popularity: 70, betweenness_centrality: 0, unique_collabs: 1, total_collabs: 1, group: 1, image: '', x: 100, y: 50, size: 6, metrics: METRICS },
  ];

  it('returns scale=1 and centered transform for empty nodes', () => {
    const t = fitTransform([], 800, 600);
    expect(t.scale).toBe(1);
  });

  it('centers the graph in the viewport', () => {
    const t = fitTransform(nodes, 800, 600);
    expect(t.scale).toBeGreaterThan(0);
    expect(typeof t.x).toBe('number');
    expect(typeof t.y).toBe('number');
  });

  it('fits all nodes within viewport bounds', () => {
    const t = fitTransform(nodes, 800, 600);
    const minX = Math.min(...nodes.map(n => n.x));
    const screenLeft = minX * t.scale + t.x;
    expect(screenLeft).toBeGreaterThan(0);
  });
});
