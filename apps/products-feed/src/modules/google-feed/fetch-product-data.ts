// TODO: Refactor this file to fetcher-like class

import { Client } from "urql";

import { VARIANTS_PER_PAGE } from "@/settings";

import {
  BasicProductDataFragment,
  FetchProductCursorsDocument,
  FetchProductVariantsDataDocument,
  FetchRelatedProductsDataDocument,
  ProductAttributesFragment,
  RelatedProductsFragment,
} from "../../../generated/graphql";
import { createLogger } from "../../logger";

export type ProductVariant = Omit<BasicProductDataFragment, "product"> &
  ProductAttributesFragment & { product: RelatedProductsFragment };

const fetchCursorRecursive = async (params: {
  cursors: string[];
  hasNext: boolean;
  after: string;
  client: Pick<Client, "query">;
  channel: string;
}) => {
  if (!params.hasNext) {
    return params.cursors;
  }

  const innerResult = await params.client
    .query(FetchProductCursorsDocument, {
      channel: params.channel,
      first: VARIANTS_PER_PAGE,
      after: params.after,
    })
    .toPromise();

  return fetchCursorRecursive({
    client: params.client,
    cursors: [...params.cursors, innerResult.data?.productVariants?.pageInfo.startCursor as string],
    hasNext: innerResult.data?.productVariants?.pageInfo.hasNextPage as boolean,
    channel: params.channel,
    after: innerResult.data?.productVariants?.pageInfo.endCursor as string,
  });
};

export const getCursors = async ({
  client,
  channel,
}: {
  client: Pick<Client, "query">;
  channel: string;
}) => {
  const logger = createLogger("getCursors");

  logger.debug(`Fetching product cursors for channel ${channel}`);

  const firstResult = await client
    .query(FetchProductCursorsDocument, { channel: channel, first: VARIANTS_PER_PAGE })
    .toPromise();

  const hasNextPage = firstResult.data?.productVariants?.pageInfo.hasNextPage as boolean;

  const recursiveCursors = await fetchCursorRecursive({
    client,
    channel,
    after: firstResult.data?.productVariants?.pageInfo.endCursor as string,
    hasNext: hasNextPage,
    cursors: [firstResult.data?.productVariants?.pageInfo.startCursor as string],
  });

  return recursiveCursors;
};

export const fetchVariants = async ({
  client,
  after,
  channel,
  imageSize,
}: {
  client: Client;
  after?: string;
  channel: string;
  imageSize?: number;
}): Promise<ProductVariant[]> => {
  const logger = createLogger("fetchVariants");

  logger.debug(`Fetching variants for channel ${channel} with cursor ${after}`);

  const productVariantsData = await client
    .query(FetchProductVariantsDataDocument, {
      channel: channel,
      first: VARIANTS_PER_PAGE,
      after,
    })
    .toPromise();

  if (productVariantsData.error) {
    logger.error(
      `Error during the GraphqlAPI call (productVariantsData): ${productVariantsData.error.message}`,
      {
        error: productVariantsData.error,
      },
    );

    return [];
  }

  const allProductIds =
    productVariantsData.data?.productVariants?.edges.map((e) => e.node.product.id) || [];

  const productIds = Array.from(new Set(allProductIds));

  const relatedProductsData = await client
    .query(FetchRelatedProductsDataDocument, {
      ids: productIds,
      imageSize,
    })
    .toPromise();

  if (relatedProductsData.error) {
    logger.error(
      `Error during the GraphqlAPI call (relatedProductsData): ${relatedProductsData.error.message}`,
      {
        error: relatedProductsData.error,
      },
    );

    return [];
  }

  const variantEdges = productVariantsData.data?.productVariants?.edges || [];

  try {
    const productVariants = variantEdges
      .map((e) => {
        const relatedProductEdge = relatedProductsData.data?.products?.edges.find(
          (product) => product.node.id === e.node.product.id,
        );

        const product = relatedProductEdge?.node;

        if (!product) {
          // TODO: migrate to modern errors
          throw new Error("Product not found for variant");
        }

        return {
          ...e.node,
          product,
        };
      })
      .filter((e) => e !== null);

    logger.debug("Product variants fetched successfully", {
      first: productVariants[0],
      totalLength: productVariants.length,
    });

    return productVariants;
  } catch (error) {
    logger.error("Error during the product variants mapping", {
      error: error instanceof Error ? error.message : error,
    });

    return [];
  }
};
