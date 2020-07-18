export function getTopologicalSorting<V extends number | string | symbol = any>(
  edges: Record<V, V[]>,
): V[] {
  const vertices = Object.keys(edges) as V[];
  const visited = new Set<V>();

  const topologicallySortedVertices: V[] = [];
  let currentPath: V[] = [];

  const dfs = (vertex: V) => {
    if (currentPath.includes(vertex)) {
      const cycle = `${currentPath.join('->')}->${vertex}`;

      throw new Error(`Cycle detected: ${cycle}`);
    }

    if (visited.has(vertex)) {
      return;
    }

    currentPath.push(vertex);
    visited.add(vertex);

    if (edges[vertex]) {
      edges[vertex].forEach(dfs);
    }

    topologicallySortedVertices.unshift(vertex);
    currentPath.pop();
  };

  vertices.forEach((vertex) => {
    currentPath = [];

    dfs(vertex);
  });

  return topologicallySortedVertices;
}
