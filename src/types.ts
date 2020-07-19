export type StateUpdater<S> = (state: S) => S;

export type StateSynchronizer<S> = (state: S, previousState: Readonly<S>) => S;

export interface ComposableStateSynchronizer<S, K extends keyof any = keyof S> {
  /**
   * The name of a piece of state that the synchronizer updates
   */
  stateKey: K;
  /**
   * Names of pieces of state that the synchronizer depends on
   */
  dependenciesKeys: K[];
  synchronizer: StateSynchronizer<S>;
}
