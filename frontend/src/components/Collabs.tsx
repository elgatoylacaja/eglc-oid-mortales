import { Pause, Play } from "lucide-react";
import { Edge, Node } from "../types";
import { edgeKey } from "../utils/graph";

type Props = {
  edges: Edge[];
  activeNodeIndex: Map<string, Node>;
  selectedNode: string | null;
  playingEdge: Edge | null;
  onToggle: (edge: Edge) => void;
}

export default function Collabs(props: Props) {
  const {
    edges,
    activeNodeIndex,
    selectedNode,
    playingEdge,
    onToggle
  } = props;

  const collabs = edges.filter(e => e.source === selectedNode || e.target === selectedNode);

  return (
    <div className="absolute bottom-4 right-4 w-58 max-h-40 overflow-y-scroll bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl">
      <div className="px-3 py-2 sticky top-0 z-20 bg-zinc-800 border-b border-zinc-700 text-xs text-zinc-400 font-medium">
        Colaboraciones ({collabs.length})
      </div>
      {collabs
        .sort((a, b) => b.weight - a.weight).map((edge, i) => {
          const srcNode = activeNodeIndex.get(edge.source);
          const tgtNode = activeNodeIndex.get(edge.target);
          if (!srcNode || !tgtNode) return null;

          const source = activeNodeIndex.get(selectedNode!)!;
          const target = srcNode.name === source.name ? tgtNode : srcNode;

          return (
            <div
              key={edgeKey(edge.source, edge.target)}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-700 text-left"
            >
              <span className="text-zinc-500 text-xs w-3 text-right shrink-0">{i + 1}</span>

              <div className='flex *:size-6 *:rounded-full *:object-cover *:shrink-0'>

                <img src={target.image} alt="" className="z-0" />
              </div>
              <div className="text-xs flex-1 flex flex-col gap-0.5">
                <span className="text-zinc-200">{target.name} </span>

                <span className="text-zinc-100 text-[10px]">({edge.weight} {edge.weight === 1 ? 'canción' : 'canciones'})</span>
              </div>

              {edge.preview && (
                <button
                  className="shrink-0 text-zinc-400 hover:text-zinc-200"
                  onClick={() => onToggle(edge)}
                  aria-label={playingEdge?.preview === edge.preview ? "Pausar" : "Reproducir"}
                >
                  {playingEdge?.preview === edge.preview ? (
                    <Pause className="size-4" />
                  ) : (
                    <Play className="size-4" />
                  )}
                </button>
              )}
            </div>
          )
        })}
    </div>
  )
}
