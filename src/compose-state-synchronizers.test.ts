import { composeStateSynchronizers } from './compose-state-synchronizers';
import { createComposableStateSynchronizer } from './create-composable-state-synchronizer';
import { ComposableStateSynchronizer } from './types';

describe('composeStateSynchronizers', () => {
  it('should return a function', () => {
    expect.hasAssertions();

    const synchronizer = composeStateSynchronizers([]);

    expect(synchronizer).toBeInstanceOf(Function);
  });

  it('should throw an error when there is a cycle in the dependencies', () => {
    expect.hasAssertions();

    const synchronizers: ComposableStateSynchronizer<{
      a: number;
      b: number;
    }>[] = [
      {
        stateKey: 'a',
        dependenciesKeys: ['b'],
        synchronizer: jest.fn(),
      },
      {
        stateKey: 'b',
        dependenciesKeys: ['a'],
        synchronizer: jest.fn(),
      },
    ];

    expect(() => composeStateSynchronizers(synchronizers)).toThrow(
      'Cycle detected: b->a->b',
    );
  });

  describe('returned state synchronizer', () => {
    interface TableState {
      pageSize: number;
      recordsCount: number;
      maxPage: number;
      currentPage: number;
    }

    const initialState: TableState = {
      pageSize: 10,
      recordsCount: 20,
      maxPage: 2,
      currentPage: 1,
    };

    const maxPageUpdater = jest.fn(
      (state: TableState): TableState => ({
        ...state,
        maxPage: Math.max(1, Math.ceil(state.recordsCount / state.pageSize)),
      }),
    );
    const currentPageUpdater = jest.fn(
      (state: TableState): TableState => ({
        ...state,
        currentPage: Math.min(state.currentPage, state.maxPage),
      }),
    );
    const synchronizers = [
      createComposableStateSynchronizer(maxPageUpdater, 'maxPage', [
        'recordsCount',
        'pageSize',
      ]),
      createComposableStateSynchronizer(currentPageUpdater, 'currentPage', [
        'maxPage',
      ]),
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should run necessary synchronizers in correct order when the state changed', () => {
      expect.hasAssertions();

      const synchronizer = composeStateSynchronizers(synchronizers);

      const newState: TableState = {
        ...initialState,
        recordsCount: 17,
      };

      const result = synchronizer(newState, initialState);

      expect(maxPageUpdater).toHaveBeenCalledTimes(1);
      expect(currentPageUpdater).not.toHaveBeenCalled();
      expect(result).toStrictEqual(newState);
    });

    it('should propagate the change made by the synchronizers', () => {
      expect.hasAssertions();

      const synchronizer = composeStateSynchronizers(synchronizers);

      const newState: TableState = {
        ...initialState,
        recordsCount: 28,
      };

      const result = synchronizer(newState, initialState);

      expect(maxPageUpdater).toHaveBeenCalledTimes(1);
      expect(currentPageUpdater).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        ...newState,
        maxPage: 3,
      });
    });

    it('should propagate the change made by the synchronizers (2)', () => {
      expect.hasAssertions();

      const synchronizer = composeStateSynchronizers(synchronizers);

      const newState: TableState = {
        ...initialState,
        recordsCount: 28,
        currentPage: 4,
      };

      const result = synchronizer(newState, initialState);

      expect(maxPageUpdater).toHaveBeenCalledTimes(1);
      expect(currentPageUpdater).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        ...newState,
        maxPage: 3,
        currentPage: 3,
      });
    });

    it('should pass state returned from earlier synchronizer to the later one', () => {
      expect.hasAssertions();

      const synchronizer = composeStateSynchronizers(synchronizers);

      const newState: TableState = {
        ...initialState,
        recordsCount: 28,
        currentPage: 4,
      };

      synchronizer(newState, initialState);

      expect(maxPageUpdater).toHaveBeenCalledWith(newState);
      expect(currentPageUpdater).toHaveBeenCalledWith(
        maxPageUpdater.mock.results[0].value,
      );
    });
  });
});
