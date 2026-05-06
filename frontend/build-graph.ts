import { readFile, writeFile } from "fs/promises";
import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import noverlap from "graphology-layout-noverlap";
import circular from "graphology-layout/circular";
import { METRIC_SCALES, computeSize } from "./src/metrics-config";

type NodeRow = Record<string, string>;

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split("\n");
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

async function run() {
  console.log("Reading CSVs...");

  const [nodesContent, edgesContent] = await Promise.all([
    readFile("../output/nodes-full.csv", "utf-8"),
    readFile("../output/edges-full.csv", "utf-8"),
  ]);

  const nodes = parseCSV(nodesContent);
  const edges = parseCSV(edgesContent);

  console.log(`Loaded ${nodes.length} nodes, ${edges.length} edges`);

  const graph = new Graph({ type: "undirected", multi: false });

  for (const node of nodes) {
    graph.addNode(node.name, {
      spotify_id: node.spotify_id,
      name: node.name,
      followers: Number(node.followers),
      popularity: Number(node.popularity),
      betweeness_centrality: Number(node.betweeness_centrality),
      group: Number(node.group),
      unique_collabs: Number(node.unique_collabs),
      total_collabs: Number(node.total_collabs),
      image: node.image,
      size: 0,
    });
  }

  let skipped = 0;
  for (const edge of edges) {
    const { source, target } = edge;
    if (
      !graph.hasNode(source) ||
      !graph.hasNode(target) ||
      source === target ||
      graph.hasEdge(source, target)
    ) {
      skipped++;
      continue;
    }
    graph.addEdge(source, target, {
      weight: Number(edge.weight),
      track_name: edge.track_name,
      track_id: edge.track_id,
    });
  }

  console.log(
    `Graph built: ${graph.order} nodes, ${graph.size} edges (${skipped} edges skipped)`,
  );

  type MetricKey = Exclude<keyof typeof METRIC_SCALES, "none">;
  const metricLayouts = new Map<
    MetricKey,
    Map<string, { x: number; y: number; size: number }>
  >();

  // FA2 reflects graph topology (collab edges), not node sizes — run it once.
  console.log("Assigning initial circular positions...");
  circular.assign(graph);

  console.log("Running ForceAtlas2 (1000 iterations)...");
  const fa2Settings = forceAtlas2.inferSettings(graph);
  forceAtlas2.assign(graph, { iterations: 1000, settings: fa2Settings });

  // Snapshot FA2 positions to restore before each metric's noverlap pass.
  const fa2Positions = new Map<string, { x: number; y: number }>();
  for (const node of nodes) {
    const { x, y } = graph.getNodeAttributes(node.name);
    fa2Positions.set(node.name, { x, y });
  }

  // Per metric: restore FA2 positions, set metric sizes, run noverlap.
  for (const [key, cfg] of Object.entries(METRIC_SCALES) as [MetricKey, (typeof METRIC_SCALES)[MetricKey]][]) {
    if (key === "none") continue;
    console.log(`\nnoverlap for metric: ${key}`);

    const getRawValue = (node: NodeRow): number => {
      switch (key) {
        case "followers":      return Number(node.followers);
        case "popularity":     return Number(node.popularity);
        case "betweenness":    return Number(node.betweeness_centrality);
        case "unique_collabs": return Number(node.unique_collabs);
        case "total_collabs":  return Number(node.total_collabs);
        default: {
          const _exhaustive: never = key;
          throw new Error(`Unhandled metric: ${_exhaustive}`);
        }
      }
    };

    for (const node of nodes) {
      const pos = fa2Positions.get(node.name)!;
      graph.setNodeAttribute(node.name, "x", pos.x);
      graph.setNodeAttribute(node.name, "y", pos.y);
      graph.setNodeAttribute(
        node.name,
        "size",
        computeSize(getRawValue(node), cfg.scale, cfg.domain, cfg.minR, cfg.maxR),
      );
    }

    noverlap.assign(graph, {
      maxIterations: 1000,
      settings: { margin: 2, ratio: 1.05, speed: 5 },
    });

    const positions = new Map<string, { x: number; y: number; size: number }>();
    for (const node of nodes) {
      const attrs = graph.getNodeAttributes(node.name);
      positions.set(node.name, { x: attrs.x, y: attrs.y, size: attrs.size });
    }
    metricLayouts.set(key, positions);
  }

  console.log("\nWriting output files...");

  const outputNodes = nodes.map((node) => {
    const metrics = Object.fromEntries(
      [...metricLayouts.entries()].map(([key, positions]) => [
        key,
        positions.get(node.name)!,
      ]),
    );
    return {
      name: node.name,
      spotify_id: node.spotify_id,
      followers: Number(node.followers),
      popularity: Number(node.popularity),
      betweeness_centrality: Number(node.betweeness_centrality),
      group: Number(node.group),
      unique_collabs: Number(node.unique_collabs),
      total_collabs: Number(node.total_collabs),
      image: node.image,
      metrics,
    };
  });

  const outputEdges = edges.map((edge) => ({
    s: edge.source,
    t: edge.target,
    w: Number(edge.weight),
    tn: edge.track_name,
    p: edge.preview
      .replace("https://p.scdn.co/mp3-preview/", "")
      .replace(/\?cid=.*$/, ""),
  }));

  await Promise.all([
    writeFile(
      "public/data/nodes-with-positions.json",
      JSON.stringify(outputNodes),
    ),
    writeFile("public/data/edges-output.json", JSON.stringify(outputEdges)),
  ]);

  console.log(
    "Done! Wrote nodes-with-positions.json and edges-output.json to public/data/",
  );
}

run().catch(console.error);
