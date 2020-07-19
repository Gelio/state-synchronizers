import { createStateSynchronizer } from './create-state-synchronizer';

describe('createStateSynchronizer', () => {
  it('should return a function', () => {
    expect.hasAssertions();

    const result = createStateSynchronizer(jest.fn(), ['a', 'b']);

    expect(result).toBeInstanceOf(Function);
  });

  describe('returned state synchronizer', () => {
    interface User {
      name: string;
      age: number;
      legalAge: boolean;
    }

    const initialState: User = {
      name: 'John',
      age: 10,
      legalAge: false,
    };

    const updateLegalAge = jest.fn((state: User) => ({
      ...state,
      legalAge: state.age >= 21,
    }));

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should run the updater when a dependency changed', () => {
      expect.hasAssertions();

      const legalAgeSynchronizer = createStateSynchronizer(updateLegalAge, [
        'age',
      ]);

      const newState = { ...initialState, age: 11 };
      const result = legalAgeSynchronizer(newState, initialState);

      expect(updateLegalAge).toHaveBeenCalledTimes(1);
      expect(updateLegalAge).toHaveBeenCalledWith(newState);
      expect(result).toStrictEqual(updateLegalAge.mock.results[0].value);
    });

    it('should not run the updater when no dependencies changed', () => {
      expect.hasAssertions();

      const legalAgeSynchronizer = createStateSynchronizer(updateLegalAge, [
        'age',
      ]);

      const newState = { ...initialState, name: 'Ann' };
      const result = legalAgeSynchronizer(newState, initialState);

      expect(updateLegalAge).not.toHaveBeenCalled();
      expect(result).toStrictEqual(newState);
    });

    it('should not call the updater when the dependencies array is empty', () => {
      expect.hasAssertions();

      const legalAgeSynchronizer = createStateSynchronizer(updateLegalAge, []);

      const newState: User = { name: 'Ann', age: 50, legalAge: true };
      const result = legalAgeSynchronizer(newState, initialState);

      expect(updateLegalAge).not.toHaveBeenCalled();
      expect(result).toStrictEqual(newState);
    });
  });
});
