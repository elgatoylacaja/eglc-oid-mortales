import type { Node, SizeMetric } from "../types";
import { METRIC_SCALES, NONE_SIZE, computeSize } from "../metrics-config";
import { formatFollowers } from "./format";

export { NONE_SIZE } from "../metrics-config";

type MetricConfig = {
  label: string;
  getValue: (node: Node) => number;
  format: (value: number) => string;
};

const METRICS: Record<SizeMetric, MetricConfig> = {
  followers: {
    label: "Seguidores",
    getValue: (n) => n.followers,
    format: formatFollowers,
  },
  popularity: {
    label: "Popularidad",
    getValue: (n) => n.popularity,
    format: (v) => String(v),
  },
  betweenness: {
    label: "Centralidad",
    getValue: (n) => n.betweenness_centrality,
    format: (v) => Math.round(v).toLocaleString(),
  },
  unique_collabs: {
    label: "Colaboraciones Únicas",
    getValue: (n) => n.unique_collabs,
    format: (v) => String(v),
  },
  total_collabs: {
    label: "Colaboraciones Totales",
    getValue: (n) => n.total_collabs,
    format: (v) => String(v),
  },
  none: {
    label: "Ninguna",
    getValue: () => NONE_SIZE,
    format: () => "",
  },
};

export const METRIC_OPTIONS: { key: SizeMetric; label: string }[] = (
  Object.entries(METRICS) as [SizeMetric, MetricConfig][]
).map(([key, cfg]) => ({ key, label: cfg.label }));

export function getMetricValue(node: Node, metric: SizeMetric): number {
  return METRICS[metric].getValue(node);
}

export function formatMetricValue(value: number, metric: SizeMetric): string {
  return METRICS[metric].format(value);
}

export function getMetricLabel(metric: SizeMetric): string {
  return METRICS[metric].label;
}

export function getNodeRadius(node: Node, metric: SizeMetric): number {
  const { getValue } = METRICS[metric];
  const { scale, domain, minR, maxR } = METRIC_SCALES[metric];
  return computeSize(getValue(node), scale, domain, minR, maxR);
}
