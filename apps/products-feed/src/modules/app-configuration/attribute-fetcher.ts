import { Client } from "urql";
import {
  AttributeWithMappingFragmentFragment,
  FetchAttributesWithMappingDocument,
} from "../../../generated/graphql";
import { createLogger } from "../../logger";

const logger = createLogger("AttributeFetcher");

export class AttributeFetcher {
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

    logger.debug("Fetching attributes");

    await this.fetchRecursivePage(attributes, undefined);

    logger.info("Attributes fetched successfully", {
      first: attributes[0],
      totalLength: attributes.length,
    });

    return attributes;
  }
}
