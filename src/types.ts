export type StateUpdater<S> = (state: S) => S;

export type StateSynchronizer<S> = (state: S, previousState: Readonly<S>) => S;

export interface ComposableStateSynchronizer<S, K extends keyof any = keyof S> {
  stateKey: K;
  dependenciesKeys: K[];
  synchronizer: StateSynchronizer<S>;
}
