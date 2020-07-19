import { createStateSynchronizer } from './create-state-synchronizer';
import { StateUpdater, ComposableStateSynchronizer } from './types';

export const createComposableStateSynchronizer = <S>(
  updater: StateUpdater<S>,
  stateKey: keyof S,
  dependenciesKeys: (keyof S)[],
): ComposableStateSynchronizer<S> => ({
  stateKey,
  dependenciesKeys,
  synchronizer: createStateSynchronizer(updater, dependenciesKeys),
});
