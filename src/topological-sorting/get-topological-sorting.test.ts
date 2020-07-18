import { getTopologicalSorting } from './get-topological-sorting';

describe('getTopologicalSorting', () => {
  interface TopologicalSortingScenario {
    description: string;
    edges: Record<string, string[]>;
    expectedResult: string[];
  }

  const topologicalSortingScenarios: TopologicalSortingScenario[] = [
    {
      description: 'simple 3 vertex graph',
      edges: { a: ['b', 'c'], b: ['c'] },
      expectedResult: ['a', 'b', 'c'],
    },
    {
      description: 'long chain',
      edges: { a: ['b'], b: ['c'], c: ['d'], d: ['e'] },
      expectedResult: ['a', 'b', 'c', 'd', 'e'],
    },
  ];

  describe.each(topologicalSortingScenarios)(
    'should return a topological sorting for',
    ({ edges, expectedResult, description }) => {
      it(`${description}`, () => {
        expect.hasAssertions();

        const result = getTopologicalSorting(edges);

        expect(result).toStrictEqual(expectedResult);
      });
    },
  );

  it('should return a topological sorting for two connected components', () => {
    expect.hasAssertions();

    const edges = {
      a: ['b'],
      b: ['c'],

      foo: ['bar'],
      bar: ['baz'],
    };

    const result = getTopologicalSorting(edges);

    expect(result.indexOf('a')).toBeLessThan(result.indexOf('b'));
    expect(result.indexOf('b')).toBeLessThan(result.indexOf('c'));

    expect(result.indexOf('foo')).toBeLessThan(result.indexOf('bar'));
    expect(result.indexOf('bar')).toBeLessThan(result.indexOf('baz'));
  });

  interface ErrorScenario {
    description: string;
    edges: Record<string, string[]>;
    expectedErrorMessage: string;
  }

  const errorScenarios: ErrorScenario[] = [
    {
      description: 'a vertex connected to itself',
      edges: {
        a: ['a', 'b'],
        b: ['c'],
      },
      expectedErrorMessage: 'Cycle detected: a->a',
    },
    {
      description: 'a vertex connected to itself',
      edges: {
        a: ['b'],
        b: ['a'],
      },
      expectedErrorMessage: 'Cycle detected: a->b->a',
    },
  ];

  describe.each(errorScenarios)(
    'should throw an error when there is',
    ({ description, edges, expectedErrorMessage }) => {
      it(`${description}`, () => {
        expect.hasAssertions();

        expect(() => getTopologicalSorting(edges)).toThrow(
          expectedErrorMessage,
        );
      });
    },
  );
});
