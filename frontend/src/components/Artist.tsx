import { twMerge } from "tailwind-merge";
import { Node, SizeMetric } from "../types";
import { formatMetricValue, getMetricValue, METRIC_OPTIONS } from "../utils/metrics";

type Props = {
  node: Node
  sizeMetric: SizeMetric
}

export default function Artist(props: Props) {
  const { node, sizeMetric } = props;
  return <div
    className={
      twMerge(
        "absolute bottom-4 left-4 w-50 z-50",
        "rounded-lg px-3 py-2",
        "pointer-events-none",
        "bg-zinc-800 border border-zinc-700"
      )
    }
  >
    <div className="flex items-center gap-3 mb-2">
      <img
        src={node.image}
        alt={node.name}
        className="size-10 rounded-full object-cover shrink-0"
      />
      <span className="text-white font-semibold text-sm leading-tight truncate">{node.name}</span>
    </div>
    <div className="flex flex-col gap-0.5">
      {METRIC_OPTIONS.map(({ key, label }) => {
        if (key === 'none') return null;
        const value = getMetricValue(node, key);
        const isActive = key === sizeMetric;
        return (
          <div key={key} className={`flex justify-between text-xs gap-4 ${isActive ? 'text-white font-semibold' : 'text-zinc-400'}`}>
            <span>{label}</span>
            <span>{formatMetricValue(value, key)}</span>
          </div>
        );
      })}
    </div>
  </div>
}