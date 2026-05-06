import { memo } from 'react';
import type { Edge, Node } from '../types';
import { edgeKey } from '../utils/graph';
import { HIGHLIGHT_COLOR } from './Nodes';

type Props = {
  edges: Edge[];
  nodeIndex: Map<string, Node>;
  highlightedEdges: Set<string> | null;
  renderMode?: 'all' | 'base' | 'highlighted';
};

export const Edges = memo(function Edges({
  edges,
  nodeIndex,
  highlightedEdges,
  renderMode = 'all',
}: Props) {
  const hasSelection = highlightedEdges !== null;

  const lines = edges.flatMap(edge => {
    const src = nodeIndex.get(edge.source);
    const tgt = nodeIndex.get(edge.target);
    if (!src || !tgt) return [];
    const key = edgeKey(edge.source, edge.target);
    const isHighlighted = highlightedEdges?.has(key) ?? false;

    if (renderMode === 'base' && isHighlighted) return [];
    if (renderMode === 'highlighted' && !isHighlighted) return [];

    const opacity = hasSelection && renderMode !== 'highlighted'
      ? (isHighlighted ? 0.8 : 0.06)
      : (hasSelection ? 0.8 : 0.15);
    const stroke = isHighlighted ? HIGHLIGHT_COLOR : '#c6c6c6';
    // base edges: uniform thin; highlighted: weight-scaled and thicker
    const strokeWidth = isHighlighted
      ? Math.min(14, Math.max(5, edge.weight * 0.8))
      : 3;

    return [(
      <line
        className='transition-all'
        key={key}
        x1={src.x} y1={src.y}
        x2={tgt.x} y2={tgt.y}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={opacity}
      />
    )];
  });


  return <g>{lines}</g>;
});
