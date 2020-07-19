import { StateUpdater, StateSynchronizer } from './types';

/**
 * Works only for plain JS objects and top-level properties.
 *
 * @param dependenciesKeys Names of properties of state. When any changes, `updater` will be run.
 * @returns A state synchronizer that runs the updater whenever a dependency changes.
 */
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
