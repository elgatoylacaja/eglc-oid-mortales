import { useEffect, useState } from "react";
import type { Node, Edge, SizeMetric, NodeMetricData } from "../types";

type GraphData = {
  nodes: Node[];
  edges: Edge[];
  loading: boolean;
  error: string | null;
};

const INITIAL: GraphData = {
  nodes: [],
  edges: [],
  loading: true,
  error: null,
};

export function useGraphData(): GraphData {
  const [state, setState] = useState<GraphData>(INITIAL);

  useEffect(() => {
    Promise.all([
      fetch("/data/nodes-with-positions.json").then((r) => r.json()),
      fetch("/data/edges-output.json").then((r) => r.json()),
    ])
      .then(([rawNodes, rawEdges]) => {
        const nodes: Node[] = (rawNodes as Record<string, unknown>[]).map(
          (n) => {
            const metrics = n.metrics as Record<SizeMetric, NodeMetricData>;
            const defaultPos = metrics.followers;
            return {
              name: String(n.name),
              spotify_id: String(n.spotify_id),
              followers: Number(n.followers),
              popularity: Number(n.popularity),
              betweenness_centrality: Number(n.betweeness_centrality),
              unique_collabs: Number(n.unique_collabs),
              total_collabs: Number(n.total_collabs),
              group: Number(n.group),
              image: String(n.image),
              x: defaultPos.x,
              y: defaultPos.y,
              size: defaultPos.size,
              metrics,
            };
          },
        );
        const nodeIndex = new Map(nodes.map((n) => [n.name, n]));
        const edges: Edge[] = (rawEdges as Record<string, unknown>[])
          .filter(
            (e) =>
              nodeIndex.has(String(e.s)) &&
              nodeIndex.has(String(e.t)),
          )
          .map((e) => ({
            source: String(e.s),
            target: String(e.t),
            weight: Number(e.w),
            track_name: String(e.tn ?? ""),
            track_id: "",
            preview: e.p ? `https://p.scdn.co/mp3-preview/${String(e.p)}` : "",
          }));
        setState({ nodes, edges, loading: false, error: null });
      })
      .catch((err: unknown) =>
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : String(err),
        })),
      );
  }, []);

  return state;
}
