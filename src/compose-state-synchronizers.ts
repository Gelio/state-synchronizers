import { ComposableStateSynchronizer, StateSynchronizer } from './types';
import { getTopologicalSorting } from './topological-sorting';

export const composeStateSynchronizers = <S, K extends keyof any>(
  stateSynchronizers: ComposableStateSynchronizer<S, K>[],
): StateSynchronizer<S> => {
  const edges = getEdges(stateSynchronizers);
  const synchronizersForState = getSynchronizersForState(stateSynchronizers);

  const orderOfSynchronizers = getTopologicalSorting(edges).filter(
    (stateKey) => !!synchronizersForState[stateKey],
  );

  const orderedSynchronizers = orderOfSynchronizers.flatMap(
    (stateKey) => synchronizersForState[stateKey],
  );

  return (state, previousState) => {
    let lastState = state;

    orderedSynchronizers.forEach(
      (synchronizer) => (lastState = synchronizer(lastState, previousState)),
    );

    return lastState;
  };
};

const getEdges = <K extends keyof any>(
  stateSynchronizers: ComposableStateSynchronizer<any, K>[],
) => {
  const edges: Record<K, K[]> = {} as any;

  stateSynchronizers.forEach(({ stateKey, dependenciesKeys }) => {
    dependenciesKeys.forEach((dependencyKey) => {
      if (!edges[dependencyKey]) {
        edges[dependencyKey] = [];
      }

      edges[dependencyKey].push(stateKey);
    });
  });

  return edges;
};

const getSynchronizersForState = <S, K extends keyof any>(
  stateSynchronizers: ComposableStateSynchronizer<S, K>[],
) => {
  const synchronizersForState: Record<K, StateSynchronizer<S>[]> = {} as any;

  stateSynchronizers.forEach(({ stateKey, synchronizer }) => {
    if (!synchronizersForState[stateKey]) {
      synchronizersForState[stateKey] = [];
    }
    synchronizersForState[stateKey].push(synchronizer);
  });

  return synchronizersForState;
};
