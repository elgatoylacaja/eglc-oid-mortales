# oid-mortales

Visualización interactiva de la red de colaboraciones musicales del reggaetón y la música urbana latina. Basada en datos de Spotify: 864 artistas, 8.800+ colaboraciones.

## Estructura del proyecto

```
data/               Datos fuente (CSVs de Spotify)
notebooks/          Pipeline de análisis (Jupyter)
output/             CSVs procesados (generados por el notebook)
frontend/           Aplicación React
```

## Pipeline de datos

```
notebooks/analysis.ipynb
  → output/nodes-full.csv
  → output/edges-full.csv

frontend/build-graph.ts  (pnpm build-graph)
  → frontend/public/data/nodes-with-positions.json
  → frontend/public/data/edges-output.json
```

`build-graph.ts` construye el grafo con [Graphology](https://graphology.github.io/), calcula el layout con ForceAtlas2 + noverlap por métrica, y escribe los JSON listos para el frontend.

## Setup

### Requisitos

- Python 3.11+ con Jupyter
- Node.js 20+ y [pnpm](https://pnpm.io/)

### Notebook

```bash
pip install pandas numpy
jupyter notebook notebooks/analysis.ipynb
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Para regenerar los JSON de posiciones (necesario si se actualizan los CSVs en `output/`):

```bash
cd frontend
pnpm build-graph
```

## Métricas disponibles

| Métrica | Descripción |
|---|---|
| Seguidores | Seguidores en Spotify |
| Popularidad | Score de popularidad (0–100) |
| Centralidad | Betweenness centrality en el grafo de colaboraciones |
| Colaboraciones únicas | Número de artistas distintos con quienes colaboró |
| Colaboraciones totales | Número total de tracks en colaboración |

## Datos

Los datos fueron recolectados desde la API de Spotify. Las URLs de preview son públicas (30 segundos por track vía `p.scdn.co`).
