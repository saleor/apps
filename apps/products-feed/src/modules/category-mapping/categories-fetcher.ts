import { Client } from "urql";
import {
  CategoryWithMappingFragmentFragment,
  FetchCategoriesWithMappingDocument,
} from "../../../generated/graphql";
import { createLogger } from "../../logger";

export class CategoriesFetcher {
  private logger = createLogger("CategoriesFetcher");

  constructor(private apiClient: Pick<Client, "query">) {}

  private async fetchRecursivePage(
    accumulator: CategoryWithMappingFragmentFragment[],
    cursor?: string,
  ): Promise<CategoryWithMappingFragmentFragment[]> {
    const result = await this.apiClient
      .query(FetchCategoriesWithMappingDocument, {
        cursor,
      })
      .toPromise();

    if (result.error) {
      throw new Error(result.error.message);
    }

    if (!result.data) {
      // todo sentry
      throw new Error("Empty categories data");
    }

    accumulator = [...accumulator, ...(result.data.categories?.edges.map((c) => c.node) ?? [])];

    const hasNextPage = result.data.categories?.pageInfo.hasNextPage;
    const endCursor = result.data.categories?.pageInfo.endCursor;

    if (hasNextPage && endCursor) {
      return this.fetchRecursivePage(accumulator, endCursor);
    } else {
      return accumulator;
    }
  }

  /**
   * Fetches all categories pages - standard page is max 100 items
   */
  async fetchAllCategories(): Promise<CategoryWithMappingFragmentFragment[]> {
    let categories: CategoryWithMappingFragmentFragment[] = [];

    this.logger.debug("fetchAllCategories called");

    const result = await this.fetchRecursivePage(categories, undefined);

    this.logger.debug("Categories fetched successfully", {
      first: result[0],
      totalLength: result.length,
    });

    return result;
  }
}
