import { createStateSynchronizer } from "./create-state-synchronizer";
import { StateUpdater, ComposableStateSynchronizer } from "./types";

export const createComposableStateSynchronizer = <S>(
  stateKey: keyof S,
  dependenciesKeys: (keyof S)[],
  updater: StateUpdater<S>
): ComposableStateSynchronizer<S> => ({
  stateKey,
  dependenciesKeys,
  synchronizer: createStateSynchronizer(dependenciesKeys, updater),
});
