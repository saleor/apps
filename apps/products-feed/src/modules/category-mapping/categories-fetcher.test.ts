import { Client, OperationResult } from "urql";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FetchCategoriesWithMappingQuery } from "../../../generated/graphql";
import { CategoriesFetcher } from "./categories-fetcher";

type FetchResult = OperationResult<FetchCategoriesWithMappingQuery, { cursor: string | undefined }>;

const generateCategoryEdgeMock = (uniqueIncrement: number) => {
  return {
    node: {
      name: `Category ${uniqueIncrement}`,
      id: `cat-${uniqueIncrement}`,
      googleCategoryId: `${uniqueIncrement * 2}`,
    },
  };
};

const generateArr = (length: number) => new Array(length).fill(null).map((_, index) => index);

const wait = () => new Promise((res) => setTimeout(res, 100));

describe("CategoriesFetcher", () => {
  const mockQueryPromise = vi.fn<any, FetchResult>();

  const mockClient: Pick<Client, "query"> = {
    // @ts-ignore - It's hard to mock urql mocks - but it can be improved
    query() {
      return {
        toPromise: mockQueryPromise,
      };
    },
  };

  const instance = new CategoriesFetcher(mockClient);

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("Fetches single page of categories correctly", async () => {
    mockQueryPromise.mockImplementationOnce(() => {
      const data: FetchCategoriesWithMappingQuery = {
        categories: {
          pageInfo: {
            endCursor: undefined,
            hasNextPage: false,
          },
          edges: [generateCategoryEdgeMock(1), generateCategoryEdgeMock(2)],
        },
      };

      return {
        error: undefined,
        data: data,
      } as FetchResult;
    });

    const result = await instance.fetchAllCategories();

    expect(result).toEqual([
      {
        googleCategoryId: "2",
        id: "cat-1",
        name: "Category 1",
      },
      {
        googleCategoryId: "4",
        id: "cat-2",
        name: "Category 2",
      },
    ]);
  });

  it("Fetches 3 pages correctly and merges them", async () => {
    mockQueryPromise.mockImplementationOnce(() => {
      wait();

      return {
        error: undefined,
        data: {
          categories: {
            edges: generateArr(100).map((index) => generateCategoryEdgeMock(index)),
            pageInfo: {
              hasNextPage: true,
              endCursor: "cat-99",
            },
          },
        },
      } as FetchResult;
    });

    mockQueryPromise.mockImplementationOnce(() => {
      wait();

      return {
        error: undefined,
        data: {
          categories: {
            edges: generateArr(100)
              .map((index) => index + 100)
              .map((index) => generateCategoryEdgeMock(index)),
            pageInfo: {
              hasNextPage: true,
              endCursor: "cat-199",
            },
          },
        },
      } as FetchResult;
    });

    mockQueryPromise.mockImplementationOnce(() => {
      wait();

      return {
        error: undefined,
        data: {
          categories: {
            edges: generateArr(100)
              .map((index) => index + 200)
              .map((index) => generateCategoryEdgeMock(index)),
            pageInfo: {
              hasNextPage: false,
              endCursor: undefined,
            },
          },
        },
      } as FetchResult;
    });

    const result = await instance.fetchAllCategories();

    expect(result).toHaveLength(300);

    /**
     * Some indexes assertions
     */
    [0, 5, 99, 299].forEach((index) => {
      expect(result[index]).toEqual({
        googleCategoryId: `${index * 2}`,
        id: `cat-${index}`,
        name: `Category ${index}`,
      });
    });
  });

  it("Returns empty array if not categories returned from the API", async () => {
    mockQueryPromise.mockImplementationOnce(() => {
      const data: FetchCategoriesWithMappingQuery = {
        categories: {
          pageInfo: {
            endCursor: undefined,
            hasNextPage: false,
          },
          edges: [],
        },
      };

      return {
        error: undefined,
        data: data,
      } as FetchResult;
    });

    const result = await instance.fetchAllCategories();

    expect(result).toEqual([]);
  });
});
