import { Node, SizeMetric } from "../types";
import { formatMetricValue, getMetricLabel, getMetricValue } from "../utils/metrics";

type Props = {
  sizeMetric: SizeMetric;
  top: Node[],
  handleSearchSelect: (name: string) => void;
}

export default function Ranking({ sizeMetric, top,
  handleSearchSelect,
}: Props) {
  return <div className="absolute top-4 right-4 w-58 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden">
    <div className="px-3 py-2 border-b border-zinc-700 text-xs text-zinc-400 font-medium">
      Top {top.length} · {getMetricLabel(sizeMetric)}
    </div>
    {top.map((n, i) => (
      <button
        key={n.name}
        onClick={() => handleSearchSelect(n.name)}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-700 text-left"
      >
        <span className="text-zinc-500 text-xs w-3 shrink-0">{i + 1}</span>
        <img src={n.image} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
        <span className="text-zinc-200 text-xs truncate flex-1">{n.name}</span>
        <span className="text-zinc-400 text-xs shrink-0">{formatMetricValue(getMetricValue(n, sizeMetric), sizeMetric)}</span>
      </button>
    ))}
  </div>
}