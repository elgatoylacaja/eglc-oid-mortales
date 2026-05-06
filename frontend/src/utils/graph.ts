import type { Node, Transform } from '../types';

export function edgeKey(source: string, target: string): string {
  return `${source}--${target}`;
}

export function fitTransform(
  nodes: Node[],
  width: number,
  height: number,
  padding = 40,
  maxScale = Infinity,
): Transform {
  if (nodes.length === 0) return { x: 0, y: 0, scale: 1 };
  const minX = nodes.reduce((m, n) => Math.min(m, n.x - n.size), Infinity);
  const maxX = nodes.reduce((m, n) => Math.max(m, n.x + n.size), -Infinity);
  const minY = nodes.reduce((m, n) => Math.min(m, n.y - n.size), Infinity);
  const maxY = nodes.reduce((m, n) => Math.max(m, n.y + n.size), -Infinity);
  const gw = maxX - minX;
  const gh = maxY - minY;
  const scale = Math.min((width - padding * 2) / gw, (height - padding * 2) / gh, maxScale);
  return {
    x: (width - gw * scale) / 2 - minX * scale,
    y: (height - gh * scale) / 2 - minY * scale,
    scale,
  };
}
