import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import type { Edge, Node, SizeMetric, Transform } from '../types';
import { edgeKey, fitTransform } from '../utils/graph';
import { NONE_SIZE } from '../utils/metrics';
import Artist from './Artist';
import Collabs from './Collabs';
import { Edges } from './Edges';
import { Nodes } from './Nodes';
import Ranking from './Ranking';
import Search from './Search';

type Props = {
  id: string;
  nodes: Node[];
  edges: Edge[];
  sizeMetric: SizeMetric;
  className?: string;
};

export function Graph({ id, nodes, edges, sizeMetric, className }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const activeNodes = useMemo(
    () => {
      if (sizeMetric === 'none') {
        return nodes.map(n => ({ ...n, size: NONE_SIZE }));
      } else {
        return nodes.map(n => ({ ...n, ...n.metrics[sizeMetric] }))
      }
    },
    [nodes, sizeMetric],
  );

  const activeNodeIndex = useMemo(
    () => new Map(activeNodes.map(n => [n.name, n])),
    [activeNodes],
  );

  const getSvgSize = useCallback(() => ({
    width: svgRef.current?.clientWidth ?? 800,
    height: svgRef.current?.clientHeight ?? 600,
  }), []);

  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });

  // Set initial transform before first paint so the CSS transition doesn't animate from {0,0,1}
  useLayoutEffect(() => {
    const { width, height } = getSvgSize();
    setTransform(fitTransform(activeNodes, width, height));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleResize = () => {
      const { width, height } = getSvgSize();
      setTransform(fitTransform(activeNodes, width, height));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeNodes, getSvgSize])

  const top5 = useMemo(() =>
    [...activeNodes].sort((a, b) => b.size - a.size).slice(0, 5),
    [activeNodes]
  );

  const handleSearchSelect = useCallback((name: string) => {
    setSelectedNode(name);
  }, []);

  const { highlightedNodes, highlightedEdges } = useMemo(() => {
    if (!selectedNode && !hoveredNode) return { highlightedNodes: null, highlightedEdges: null, subset: null };
    const hn = new Set<string>();
    const he = new Set<string>();

    for (const source of [selectedNode, hoveredNode]) {
      if (!source) continue;
      hn.add(source);
      for (const e of edges) {
        if (e.source === source || e.target === source) {
          hn.add(e.source);
          hn.add(e.target);
          he.add(edgeKey(e.source, e.target));
        }
      }
    }
    return { highlightedNodes: hn, highlightedEdges: he };
  }, [selectedNode, hoveredNode, edges]);

  const subset = useMemo(() => {
    if (!selectedNode) return null;
    const s = new Set<string>();
    s.add(selectedNode);
    for (const e of edges) {
      if (e.source === selectedNode) s.add(e.target);
      else if (e.target === selectedNode) s.add(e.source);
    }
    return s;
  }, [selectedNode]);

  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as Element).tagName === 'circle') return;
    setSelectedNode(null);
    setHoveredNode(null);
    const { width, height } = getSvgSize();
    setTransform(fitTransform(activeNodes, width, height));
  }, [activeNodes, getSvgSize]);

  const handleNodeHover = useCallback((node: Node) => {
    setHoveredNode(node.name);
  }, []);

  const handleNodeLeave = useCallback(() => {
    setHoveredNode(null);
  }, []);

  const handleNodeClick = useCallback((node: Node) => {
    setSelectedNode(prev => (prev === node.name ? null : node.name));
  }, []);

  useEffect(() => {
    if (subset && subset.size > 0) {
      const { width, height } = getSvgSize();
      setTransform(fitTransform(activeNodes.filter(n => subset.has(n.name)), width, height, 80, 4));
    }
  }, [subset, getSvgSize, activeNodes]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [playingEdge, setPlayingEdge] = useState<Edge | null>(null);

  const handlePreviewToggle = useCallback((edge: Edge) => {
    if (!audioRef.current) return;
    setPlayingEdge(prev => {
      if (edge.preview === prev?.preview) {
        audioRef.current!.pause();
        return null;
      }
      audioRef.current!.src = edge.preview;
      audioRef.current!.volume = 0.5;
      audioRef.current!.play().catch(() => { });
      return edge;
    });
  }, []);

  useEffect(() => {
    audioRef.current?.pause();
    setPlayingEdge(null);
  }, [selectedNode]);

  return (
    <div id={id} className={
      twMerge(
        "w-[50vw] h-[50vh] bg-linear-to-r from-white to-[#c5e5f6] overflow-hidden relative",
        className
      )
    }>

      <div className={twMerge('absolute max-w-72 top-4 left-1/2 -translate-x-1/2',
        "bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl"
      )}>
        <audio
          ref={audioRef}
          onEnded={() => setPlayingEdge(null)}
        />
        {playingEdge ? (<>
          <div className="flex items-center gap-2 p-2">
            <div className='flex items-center *:size-8 *:rounded-full *:object-cover'>
              <img src={activeNodeIndex.get(playingEdge.source)?.image} alt="" />
              <img src={activeNodeIndex.get(playingEdge.target)?.image} alt="" className="-ml-2" />
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-200 text-sm">{activeNodeIndex.get(playingEdge.source)?.name} - {activeNodeIndex.get(playingEdge.target)?.name}</span>
              <span className="text-zinc-500 text-xs">{playingEdge.track_name}</span>
            </div>
          </div>
        </>) : null}
      </div>


      <svg
        ref={svgRef}
        className="w-full h-full"
        onClick={handleClick}
      >
        <g
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
          {(selectedNode || hoveredNode) ? (
            <>
              <Nodes graphId={id} renderMode="base" nodes={activeNodes} highlightedNodes={highlightedNodes} onHover={handleNodeHover} onLeave={handleNodeLeave} onClick={handleNodeClick} />
              <Edges renderMode="highlighted" edges={edges} nodeIndex={activeNodeIndex} highlightedEdges={highlightedEdges} />
              <Nodes graphId={id} renderMode="highlighted" nodes={activeNodes} highlightedNodes={highlightedNodes} onHover={handleNodeHover} onLeave={handleNodeLeave} onClick={handleNodeClick} />
            </>
          ) : (
            <>
              <Edges renderMode="all" edges={edges} nodeIndex={activeNodeIndex} highlightedEdges={null} />
              <Nodes graphId={id} metric={sizeMetric} renderMode="all" nodes={activeNodes} highlightedNodes={null} onHover={handleNodeHover} onLeave={handleNodeLeave} onClick={handleNodeClick} />
            </>
          )}
        </g>
      </svg>

      {selectedNode !== null && (
        <Artist node={activeNodeIndex.get(selectedNode)!} sizeMetric={sizeMetric} />
      )}

      {sizeMetric !== 'none' && <Ranking
        sizeMetric={sizeMetric}
        top={top5}
        handleSearchSelect={handleSearchSelect}
      />}

      {selectedNode && (
        <Collabs
          playingEdge={playingEdge}
          onToggle={handlePreviewToggle}
          edges={edges}
          activeNodeIndex={activeNodeIndex}
          selectedNode={selectedNode}
        />
      )}

      <Search nodes={nodes} handleSearchSelect={handleSearchSelect} />
    </div>
  );
}
