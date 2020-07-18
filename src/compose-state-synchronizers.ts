import { ComposableStateSynchronizer, StateSynchronizer } from "./types";
import { getTopologicalSorting } from "./topological-sorting";

export const composeStateSynchronizers = <
  S,
  K extends string | symbol | number
>(
  stateSynchronizers: ComposableStateSynchronizer<S, K>[]
): StateSynchronizer<S> => {
  const edges: Record<K, K[]> = {} as any;
  const synchronizersForState: Record<K, StateSynchronizer<S>[]> = {} as any;

  stateSynchronizers.forEach(({ stateKey, synchronizer, dependenciesKeys }) => {
    if (!synchronizersForState[stateKey]) {
      synchronizersForState[stateKey] = [];
    }
    synchronizersForState[stateKey].push(synchronizer);

    dependenciesKeys.forEach((dependencyKey) => {
      if (!edges[dependencyKey]) {
        edges[dependencyKey] = [];
      }

      edges[dependencyKey].push(stateKey);
    });
  });

  const orderOfSynchronizers = getTopologicalSorting(edges).filter(
    (stateKey) => !!synchronizersForState[stateKey]
  );

  return (state, previousState) => {
    let lastState = state;

    orderOfSynchronizers.forEach((stateKey) => {
      synchronizersForState[stateKey].forEach(
        (synchronizer) => (lastState = synchronizer(lastState, previousState))
      );
    });

    return lastState;
  };
};
