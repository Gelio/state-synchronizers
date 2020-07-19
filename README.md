# State synchronizers 🔃

![npm version](https://img.shields.io/npm/v/state-synchronizers)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://dev.azure.com/vorenygelio/vorenygelio/_apis/build/status/Gelio.state-synchronizers?branchName=master)](https://dev.azure.com/vorenygelio/vorenygelio/_build/latest?definitionId=6&branchName=master)
![Monthly downloads](https://img.shields.io/npm/dm/state-synchronizers)
![npm bundle size](https://img.shields.io/bundlephobia/min/state-synchronizers)

A library that makes it easy to use the idea of _state synchronization_ for various state management
solutions in a declarative manner.

**Synchronized state** is a type of regular state that can depend on other pieces of state, and
thus, has to be updated when other pieces of state change, but can also be updated independently.

Want more information? Read [this post on dev.to about synchronized state](https://dev.to/gelio/synchronized-state-57c5).

Need hands-on experience? Experiment with [the CodeSandbox for `state-synchronizers`](https://codesandbox.io/s/state-synchronizers-65t0e?file=/src/App.tsx).

1. [Examples of synchronized state](#examples-of-synchronized-state)
2. [Installation](#installation)
3. [Usage](#usage)
4. [API](#api)
5. [Contributing](#contributing)

## Examples of synchronized state

Examples of synchronized state include:

- the current page number that a table displays, based on the number of records and page size
- any state that should be reset when other state changes

If you have used the library in a new way, feel free to create an issue telling about that
or raise a PR modifying the list of examples yourself 💻

## Installation

Install the library from npm:

```sh
npm install state-synchronizers
```

## Usage

There are 2 types of functions that are used by the library:

1. _State updaters_ (`(state) => synchronizedState`)

   State updaters apply the state synchronizations and are the building blocks of
   `state-synchronizers`.

   They are usually very specific and when written by the user, they will
   update a single piece of state, e.g.

   ```ts
   const updateMaxPage = (state) => ({
     ...state,
     maxPage: calculateMaxPage(state.recordsCount, state.pageSize),
   });
   ```

   State updaters are used to produce _state synchronizers_.

2. _State synchronizers_ (`(state, previousState) => synchronizedState`)

   State synchronizers are special types of state updaters - they apply the state synchronizations,
   but they can do so conditionally, because they have access to the previous state and can
   determine what changed.

   State synchronizers will often invoke state updaters conditionally, e.g.:

   ```ts
   const synchronizeMaxPage = (state, previousState) => {
     if (
       state.maxPage !== previousState.maxPage ||
       state.recordsCount !== previousState.recordsCount
     ) {
       return updateMaxPage(state);
     }

     return state;
   };
   ```

   If you are using plain JS objects, there are utility functions that take away the boilerplate of
   comparing `state` and `previousState` (see `createStateSynchronizer` and
   `createComposableStateSynchronizer`).

### Single state synchronizer

**Disclaimer:** Not using plain JS objects for state? See [Non-JS objects as state](#Non-JS-objects-as-state).

To write a single state synchronizer that will run your state updater function every time
one of its dependencies change, use `createStateSynchronizer`:

```ts
const updateMaxPage = (state) => ({
  ...state,
  maxPage: calculateMaxPage(state.recordsCount, state.pageSize),
});

const synchronizeMaxPage = createStateSynchronizer(updateMaxPage, [
  'recordsCount',
  'pageSize',
]);

// Usage:
const synchronizedState = synchronizeMaxPage(newState, previousState);
```

To avoid having to maintain `previousState`, wrap the returned `synchronizeMaxPage` in `createSynchronizedStateUpdater`:

```ts
const initialState = {
  // ...
};

const synchronizeMaxPage = createSynchronizedStateUpdater(
  createStateSynchronizer(updateMaxPage, ['recordsCount', 'pageSize']),
  initialState,
);

// Usage:
const synchronizedState = synchronizeMaxPage(newState);
```

### Multiple state synchronizers

Often you will want to synchronize multiple pieces of state, where a piece of synchronized state can
depend on other pieces of synchronized state. For this scenario, use the composition API.

The base of composition API is the `ComposableStateSynchronizer`:

```ts
const composableMaxPageSynchronizer = createComposableStateSynchronizer(
  // the updater
  updateMaxPage,
  // the piece of state that this updater synchronizes
  'maxPage',
  // dependencies of this piece of state
  ['recordsCount', 'pageSize'],
);
```

Then, the composable state synchronized can be combined into a single state synchronizer that will
run them in the order determined by the dependencies (the dependencies will update first
before a parent updates, uses [topological sorting](https://en.wikipedia.org/wiki/Topological_sorting)):

```ts
const mainStateSynchronizer = composeStateSynchronizers([
  composableMaxPageSynchronizer,
  // the synchronizer below is created similarly to composableMaxPageSynchronizer
  composableCurrentPageSynchronizer,
]);

// Usage:
const synchronizedState = synchronizeMaxPage(newState, previousState);
```

Again, you can use `createSynchronizedStateUpdater` to avoid having to maintain `previousState`:

```ts
const initialState = {
  // ...
};

const mainStateUpdater = createSynchronizedStateUpdater(
  mainStateSynchronizer,
  initialState,
);

// Usage:
const synchronizedState = synchronizeMaxPage(newState);
```

### Non-JS objects as state

`state-synchronizers` allows working with non-JS objects too, e.g. with [Immutable](https://immutable-js.github.io/immutable-js/) data structures.

However, you will have to write your own state synchronizers instead of using `createStateSynchronizer`
and `createComposableStateSynchronizer`.

To create a single state synchronizer, write it by hand:

```ts
const immutableStateSynchronizer = (state, previousState) => {
  if (state.get('maxPage') !== previousState.get('maxPage')) {
    return state.update('currentPage', (currentPage) =>
      calculateCurrentPage(currentPage, state.maxPage),
    );
  }

  return state;
};
```

It is safe the then use `createSynchronizedStateUpdater`:

```ts
const immutableUpdater = createSynchronizedStateUpdater(
  immutableStateSynchronizer,
  initialImmutableState,
);
```

To use the composition API, create the composable state synchronizer by hand:

```ts
const composableImmutableStateSynchronizer = {
  stateKey: 'maxPage',
  dependenciesKeys: ['recordsCount', 'pageSize'],
  synchronizer: immutableStateSynchronizer,
};
```

Note that `stateKey` and `dependenciesKeys` do not have to match the data in any way. They can be
arbitrary. However, they will be used to build the dependency graph in `composeStateSynchronizers`,
so make sure that the names match between multiple composable state synchronizers.

For example, the state synchronizer for `maxPage` should have `stateKey: 'maxPage'`, and the state
synchronizer for `currentPage` should have `maxPage` in its array of `dependenciesKeys`.

Combining composable state synchronizers is identical to the case when using plain JS objects:

```ts
const mainStateSynchronizer = composeStateSynchronizers([
  composableImmutableMaxPageSynchronizer,
  // the synchronizer below is created similarly to composableImmutableMaxPageSynchronizer
  composableImmutableCurrentPageSynchronizer,
]);

// Usage:
const synchronizedState = synchronizeMaxPage(newState, previousState);
```

### Synchronized reducer state

If you have an existing function that returns a modified state (e.g. a redux/React reducer) and
would like to apply state synchronization on top of it, use the `withStateSynchronization`
function and pass it a state updater:

```ts
const initialState = {
  // ...
};

// redux's reducer
const reducer = (state = initialState, action) => {
  // ...
};

const synchronizeMaxPage = createSynchronizedStateUpdater(
  createStateSynchronizer(updateMaxPage, ['recordsCount', 'pageSize']),
  initialState,
);

const synchronizedReducer = withStateSynchronization(synchronizeMaxPage)(
  reducer,
);

// Usage:
const synchroniedState = synchronizeReducer(state, action);
```

`synchronizedReducer` can be used in the same way `reducer` would be used, so it could be passed
directly to redux.

You can also use `withStateSynchronization` with a raw state updater (`updateMaxPage`). Then,
`updateMaxPage` would be run every time the `reducer` is executed. You have control over when the
state updater runs by either specifying the raw one or the one that runs conditionally.

### Usage in TypeScript

This library is TypeScript-friendly and exports its own type definitions.

It is written in TypeScript.

## API

## Contributing

The project is open for contributions. Feel free to create issues and PRs 🚀
