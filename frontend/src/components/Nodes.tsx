import { memo, useMemo } from 'react';
import type { Node, SizeMetric } from '../types';

export const NODE_COLOR = '#d8d8d8';
export const HIGHLIGHT_COLOR = '#4DADE1';
export const TOP_IMAGE_COUNT = 100;

type Props = {
  graphId: string;
  nodes: Node[];
  highlightedNodes: Set<string> | null;
  renderMode?: 'all' | 'base' | 'highlighted';
  onHover: (node: Node) => void;
  onLeave: () => void;
  onClick: (node: Node) => void;
  metric?: SizeMetric;
};

export const Nodes = memo(function Nodes({
  graphId,
  nodes,
  highlightedNodes,
  renderMode = 'all',
  onHover,
  onLeave,
  onClick,
  metric = 'none',
}: Props) {
  const hasSelection = highlightedNodes !== null;

  // Sorted descending by size — largest first. Used for imageSet and render order.
  const sortedBySize = useMemo(
    () => [...nodes].sort((a, b) => {
      if (metric === 'none') return (b.popularity - a.popularity)
      return b.size - a.size
    }),
    [nodes, metric],
  );

  const imageSet = useMemo(() => {
    if (highlightedNodes === null) {
      return new Set(sortedBySize.slice(0, TOP_IMAGE_COUNT).map(n => n.spotify_id));
    } else {
      const set = new Set<string>();
      highlightedNodes.forEach(name => {
        const node = nodes.find(n => n.name === name);
        if (node?.image) set.add(node.spotify_id);
      });
      return set;
    }
  }, [nodes, sortedBySize, highlightedNodes]);

  const [base, highlighted] = useMemo(() => {
    if (!highlightedNodes) return [nodes, [] as Node[]];
    return [
      nodes.filter(n => !highlightedNodes.has(n.name)),
      nodes.filter(n => highlightedNodes.has(n.name)),
    ];
  }, [nodes, highlightedNodes]);

  const renderNode = (node: Node, i: number) => {
    const r = node.size;
    const isHighlighted = highlightedNodes?.has(node.name) ?? false;
    const fill = isHighlighted ? HIGHLIGHT_COLOR : NODE_COLOR;
    const opacity = hasSelection && !isHighlighted ? 0.35 : 1;
    const showImage = imageSet.has(node.spotify_id) && node.image;
    const showLabel = hasSelection && isHighlighted;
    return (
      <g key={node.spotify_id}>
        <circle
          cx={node.x}
          cy={node.y}
          r={r}
          fill={fill}
          opacity={opacity}
          style={{ cursor: 'pointer' }}
          onMouseEnter={() => onHover(node)}
          onMouseLeave={onLeave}
          onClick={(e) => {
            e.stopPropagation();
            onClick(node);
          }}
        />
        {showImage && (
          <image
            href={node.image}
            x={node.x - r}
            y={node.y - r}
            width={r * 2}
            height={r * 2}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#clip-${graphId}-${node.spotify_id})`}
            opacity={opacity}
            style={{ pointerEvents: 'none' }}
          />
        )}
        {
          showLabel && (
            <text
              x={node.x}
              y={node.y + r + 24}
              textAnchor="middle"
              fill="#333"
              fontSize={24}
              className='pointer-events-none select-none text-zinc-500'
            >
              {node.name}
            </text>
          )
        }
      </g>
    );
  }

  // Only the base/all render owns the <defs> to avoid duplicate clipPath IDs
  const includeDefs = renderMode !== 'highlighted';

  // 'all' mode: render ascending by size (smallest first, largest last = on top in SVG)
  const toRender = renderMode === 'base' ? base
    : renderMode === 'highlighted' ? highlighted
      : [...sortedBySize].reverse();

  return (
    <g>
      {includeDefs && (
        <defs>
          {sortedBySize.filter(n => imageSet.has(n.spotify_id)).map(node => (
            <clipPath key={node.spotify_id} id={`clip-${graphId}-${node.spotify_id}`}>
              <circle cx={node.x} cy={node.y} r={node.size} />
            </clipPath>
          ))}
        </defs>
      )}
      {toRender.map(renderNode)}
    </g>
  );
});
