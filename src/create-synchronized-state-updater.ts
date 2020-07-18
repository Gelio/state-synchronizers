import { StateSynchronizer, StateUpdater } from "./types";

export const createSynchronizedStateUpdater = <S>(
  stateSynchronizer: StateSynchronizer<S>,
  initialState: S
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
