export type SizeMetric =
  | "followers"
  | "popularity"
  | "betweenness"
  | "unique_collabs"
  | "total_collabs"
  | "none";

export type NodeMetricData = { x: number; y: number; size: number };

export type Node = {
  name: string;
  spotify_id: string;
  followers: number;
  popularity: number;
  betweenness_centrality: number;
  unique_collabs: number;
  total_collabs: number;
  group: number;
  image: string;
  // Active position/size — derived from metrics[activeMetric] in Graph
  x: number;
  y: number;
  size: number;
  // Pre-computed layout per metric (positions differ because noverlap uses per-metric sizes)
  metrics: Record<Exclude<SizeMetric, 'none'>, NodeMetricData>;
};

export type Edge = {
  source: string;
  target: string;
  weight: number;
  track_name: string;
  track_id: string;
  preview: string;
};

export type Transform = {
  x: number;
  y: number;
  scale: number;
};
