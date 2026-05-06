import type { SizeMetric } from "./types";

export type MetricScale = "log" | "linear";

export type MetricScaleConfig = {
  scale: MetricScale;
  domain: [number, number];
  minR: number;
  maxR: number;
};

export const NONE_SIZE = 30;

export const METRIC_SCALES: Record<SizeMetric, MetricScaleConfig> = {
  followers: {
    scale: "linear",
    domain: [1_000, 55_000_000],
    minR: 20,
    maxR: 100,
  },
  popularity: { scale: "linear", domain: [50, 100], minR: 10, maxR: 100 },
  betweenness: { scale: "linear", domain: [1, 30_000], minR: 20, maxR: 100 },
  unique_collabs: { scale: "linear", domain: [1, 175], minR: 10, maxR: 100 },
  total_collabs: { scale: "linear", domain: [1, 500], minR: 10, maxR: 100 },
  none: { scale: "linear", domain: [1, 1], minR: 30, maxR: 30 },
};

export function computeSize(
  value: number,
  scale: MetricScale,
  domain: [number, number],
  minR: number,
  maxR: number,
): number {
  // Handle degenerate domain (e.g., [1, 1] for 'none' metric)
  if (domain[0] === domain[1]) {
    return minR;
  }

  const v = Math.max(domain[0], value);
  let t: number;
  if (scale === "log") {
    const logMin = Math.log10(domain[0]);
    const logMax = Math.log10(domain[1]);
    t = (Math.log10(v) - logMin) / (logMax - logMin);
  } else {
    t = (v - domain[0]) / (domain[1] - domain[0]);
  }
  return minR + Math.min(1, Math.max(0, t)) * (maxR - minR);
}
