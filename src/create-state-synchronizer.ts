import { StateUpdater, StateSynchronizer } from './types';

export const createStateSynchronizer = <S>(
  updater: StateUpdater<S>,
  dependenciesKeys: (keyof S)[],
): StateSynchronizer<S> => (state, previousState) => {
  const shouldSynchronizeState = dependenciesKeys.some(
    (dependencyKey) => state[dependencyKey] !== previousState[dependencyKey],
  );

  if (shouldSynchronizeState) {
    return updater(state);
  }

  return state;
};
