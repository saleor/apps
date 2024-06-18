import { Client } from "urql";
import {
  AttributeWithMappingFragmentFragment,
  FetchAttributesWithMappingDocument,
} from "../../../generated/graphql";
import { createLogger } from "../../logger";

export class AttributeFetcher {
  private logger = createLogger("AttributeFetcher");
  constructor(private apiClient: Pick<Client, "query">) {}

  private async fetchRecursivePage(
    accumulator: AttributeWithMappingFragmentFragment[],
    cursor?: string,
  ): Promise<AttributeWithMappingFragmentFragment[]> {
    const result = await this.apiClient
      .query(FetchAttributesWithMappingDocument, {
        cursor,
      })
      .toPromise();

    if (result.error) {
      throw new Error(result.error.message);
    }

    if (!result.data) {
      // todo sentry
      throw new Error("Empty attributes data");
    }

    accumulator = [...accumulator, ...(result.data.attributes?.edges.map((c) => c.node) ?? [])];

    const hasNextPage = result.data.attributes?.pageInfo.hasNextPage;
    const endCursor = result.data.attributes?.pageInfo.endCursor;

    if (hasNextPage && endCursor) {
      return this.fetchRecursivePage(accumulator, endCursor);
    } else {
      return accumulator;
    }
  }

  /**
   * Fetches all attribute pages - standard page is max 100 items
   */
  async fetchAllAttributes(): Promise<AttributeWithMappingFragmentFragment[]> {
    let attributes: AttributeWithMappingFragmentFragment[] = [];

    this.logger.debug("fetchAllAttributes called");

    const result = await this.fetchRecursivePage(attributes, undefined);

    this.logger.debug("Attributes fetched successfully", {
      first: result[0],
      totalLength: result.length,
    });

    return result;
  }
}
