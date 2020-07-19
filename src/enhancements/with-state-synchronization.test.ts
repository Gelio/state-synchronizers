import { withStateSynchronization } from './with-state-synchronization';

describe('withStateSynchronization', () => {
  interface State {
    value: number;
  }

  const stateUpdater = jest.fn((state: State) => ({
    ...state,
    value: state.value + 1,
  }));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const wrappedFunction = jest.fn((...args: any[]): State => ({ value: 5 }));
  const functionWithStateSynchronization = withStateSynchronization(
    stateUpdater,
  )(wrappedFunction);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call the wrapped function with passed arguments', () => {
    expect.hasAssertions();

    functionWithStateSynchronization(1, 2);

    expect(wrappedFunction).toHaveBeenCalledWith(1, 2);
  });

  it('should return the synchronized state', () => {
    expect.hasAssertions();

    const result = functionWithStateSynchronization();

    expect(result).toStrictEqual<State>({ value: 6 });
  });
});
