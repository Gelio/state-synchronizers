export function getTopologicalSorting<V extends number | string | symbol = any>(
  edges: Record<V, V[]>
): V[] {
  const vertices = Object.keys(edges) as V[];
  const visited = new Set<V>();

  const topologicallySortedVertices: V[] = [];

  const dfs = (vertex: V) => {
    // TODO: detect loops in the graph
    if (visited.has(vertex)) {
      return;
    }

    visited.add(vertex);

    if (edges[vertex]) {
      edges[vertex].forEach(dfs);
    }

    topologicallySortedVertices.unshift(vertex);
  };

  vertices.forEach(dfs);

  return topologicallySortedVertices;
}
