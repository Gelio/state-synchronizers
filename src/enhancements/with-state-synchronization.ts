import { StateUpdater } from '../types';

/**
 * Wraps an existing function with a state updater
 */
export const withStateSynchronization = <S>(stateUpdater: StateUpdater<S>) => <
  F extends (...args: any[]) => S
>(
  fn: F,
) => (...args: Parameters<F>): S => {
  const newState = fn(...args);

  const synchronizedState = stateUpdater(newState);

  return synchronizedState;
};
