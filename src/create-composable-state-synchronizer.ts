import { createStateSynchronizer } from './create-state-synchronizer';
import { StateUpdater, ComposableStateSynchronizer } from './types';

/**
 * @param stateKey The name of a piece of state that the synchronizer updates
 * @param dependenciesKeys Names of pieces of state that the synchronizer depends on
 */
export const createComposableStateSynchronizer = <S>(
  updater: StateUpdater<S>,
  stateKey: keyof S,
  dependenciesKeys: (keyof S)[],
): ComposableStateSynchronizer<S> => ({
  stateKey,
  dependenciesKeys,
  synchronizer: createStateSynchronizer(updater, dependenciesKeys),
});
