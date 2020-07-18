import { StateUpdater, StateSynchronizer } from "./types";

export const createStateSynchronizer = <S>(
  dependenciesKeys: (keyof S)[],
  updater: StateUpdater<S>
): StateSynchronizer<S> => (state, previousState) => {
  const shouldSynchronizeState = dependenciesKeys.some(
    (dependencyKey) => state[dependencyKey] !== previousState[dependencyKey]
  );

  if (shouldSynchronizeState) {
    return updater(state);
  }

  return state;
};
