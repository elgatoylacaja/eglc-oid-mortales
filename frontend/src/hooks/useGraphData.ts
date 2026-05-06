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
        const IMAGE_BASE = "https://i.scdn.co/image/";
        type ShortPos = { x: number; y: number; s: number };
        type ShortMetrics = { f: ShortPos; p: ShortPos; bc: ShortPos; uc: ShortPos; tc: ShortPos };
        const toPos = (p: ShortPos): NodeMetricData => ({ x: p.x, y: p.y, size: p.s });
        const nodes: Node[] = (rawNodes as Record<string, unknown>[]).map(
          (n) => {
            const sm = n.m as ShortMetrics;
            const metrics: Record<Exclude<SizeMetric, "none">, NodeMetricData> = {
              followers: toPos(sm.f),
              popularity: toPos(sm.p),
              betweenness: toPos(sm.bc),
              unique_collabs: toPos(sm.uc),
              total_collabs: toPos(sm.tc),
            };
            const defaultPos = metrics.followers;
            return {
              name: String(n.n),
              spotify_id: String(n.sid),
              followers: Number(n.f),
              popularity: Number(n.pop),
              betweenness_centrality: Number(n.bc),
              unique_collabs: Number(n.uc),
              total_collabs: Number(n.tc),
              group: Number(n.g),
              image: `${IMAGE_BASE}${String(n.img)}`,
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
