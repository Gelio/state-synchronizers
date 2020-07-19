import { createSynchronizedStateUpdater } from './create-synchronized-state-updater';
import { StateUpdater } from './types';

describe('createSynchronizedStateUpdater', () => {
  const synchronizer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a function', () => {
    expect.hasAssertions();

    const updater = createSynchronizedStateUpdater(synchronizer, {});

    expect(updater).toBeInstanceOf(Function);
  });

  describe('returned state updater', () => {
    interface State {
      value: number;
    }

    const initialState: State = {
      value: 0,
    };

    let updater: StateUpdater<State>;

    beforeEach(() => {
      updater = createSynchronizedStateUpdater(synchronizer, initialState);
    });

    it('should call the state synchronizer when the state changed', () => {
      expect.hasAssertions();

      const newState: State = { value: 1 };
      updater(newState);

      expect(synchronizer).toHaveBeenCalledTimes(1);
      expect(synchronizer).toHaveBeenCalledWith(newState, initialState);
    });

    it('should return the new state when the state changed', () => {
      expect.hasAssertions();

      const newState: State = { value: 1 };
      const result = updater(newState);

      expect(result).toStrictEqual(newState);
    });

    it('should not call the synchronizer when the state did not change', () => {
      expect.hasAssertions();

      updater(initialState);

      expect(synchronizer).not.toHaveBeenCalled();
    });

    it('should return the previous state when the state did not change', () => {
      expect.hasAssertions();

      const result = updater(initialState);

      expect(result).toStrictEqual(initialState);
    });

    it('should cache previous state', () => {
      expect.hasAssertions();

      const newState: State = { value: 1 };
      updater(newState);

      jest.clearAllMocks();
      updater(newState);

      expect(synchronizer).not.toHaveBeenCalled();
    });
  });
});
