import { StateSynchronizer, StateUpdater } from './types';

/**
 * @returns A state updater that runs the state synchronizer when the state changed. Caches the
 * previous state internally.
 */
export const createSynchronizedStateUpdater = <S>(
  stateSynchronizer: StateSynchronizer<S>,
  initialState: S,
): StateUpdater<S> => {
  let previousState: S = initialState;

  return (state) => {
    if (state === previousState) {
      return state;
    }

    stateSynchronizer(state, previousState);

    previousState = state;

    return state;
  };
};
