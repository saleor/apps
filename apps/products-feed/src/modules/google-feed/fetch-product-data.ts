// TODO: Refactor this file to fetcher-like class

import { url } from "inspector";
import { Client } from "urql";

import {
  BasicProductDataFragment,
  FetchBasicProductDataDocument,
  FetchProductAttributesDataDocument,
  FetchProductCursorsDocument,
  FetchProductRelationsDataDocument,
  ProductAttributesFragment,
  ProductRelationsFragment,
} from "../../../generated/graphql";
import { createLogger } from "../../logger";
import { ProductProcessingLimit } from "./product-processing-limit";

const VARIANTS_PER_PAGE = 100;

export type ProductVariant = BasicProductDataFragment &
  ProductAttributesFragment &
  ProductRelationsFragment;

export const getCursors = async ({ client, channel }: { client: Client; channel: string }) => {
  const logger = createLogger("getCursors", { saleorApiUrl: url, channel });

  logger.debug(`Fetching product cursors for channel ${channel}`);

  const processingLimit = new ProductProcessingLimit();

  let result = await client
    .query(FetchProductCursorsDocument, { channel: channel, first: VARIANTS_PER_PAGE })
    .toPromise();

  const cursors: Array<string> = [];

  processingLimit.drain();

  while (result.data?.productVariants?.pageInfo.hasNextPage) {
    const endCursor = result.data?.productVariants?.pageInfo.endCursor;

    if (endCursor) {
      cursors.push(endCursor);
      processingLimit.drain();
    }

    result = await client
      .query(FetchProductCursorsDocument, {
        channel: channel,
        first: VARIANTS_PER_PAGE,
        after: result.data.productVariants.pageInfo.endCursor,
      })
      .toPromise();
  }

  // TODO: Return cursors (stop fetching more) when the limit is exceeded
  logger.info("Processing limit status", {
    isExceeded: processingLimit.isExceeded(),
    maxPagesAllowance: processingLimit.getMaxPages(),
    takenPages: processingLimit.getProcessedPages(),
    variantsPerPage: VARIANTS_PER_PAGE,
  });

  logger.debug("Product cursors fetched successfully", {
    first: cursors[0],
    totalLength: cursors.length,
  });

  return cursors;
};

const fetchVariants = async ({
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
  const logger = createLogger("fetchVariants", { saleorApiUrl: url, channel });

  logger.debug(`Fetching variants for channel ${channel} with cursor ${after}`);

  const basicProductDataPromise = client
    .query(FetchBasicProductDataDocument, {
      channel: channel,
      first: VARIANTS_PER_PAGE,
      after,
    })
    .toPromise();

  const productAttributesDataPromise = client
    .query(FetchProductAttributesDataDocument, {
      channel: channel,
      first: VARIANTS_PER_PAGE,
      after,
    })
    .toPromise();

  const productRelationsDataPromise = client
    .query(FetchProductRelationsDataDocument, {
      channel: channel,
      first: VARIANTS_PER_PAGE,
      after,
      imageSize,
    })
    .toPromise();

  const [basicProductData, productAttributesData, productRelationsData] = await Promise.all([
    basicProductDataPromise,
    productAttributesDataPromise,
    productRelationsDataPromise,
  ]);

  if (basicProductData.error) {
    logger.error(
      `Error during the GraphqlAPI call (basicProductData): ${basicProductData.error.message}`,
      {
        error: basicProductData.error,
      },
    );
    return [];
  }

  if (productAttributesData.error) {
    logger.error(
      `Error during the GraphqlAPI call (productAttributesData): ${productAttributesData.error.message}`,
      {
        error: productAttributesData.error,
      },
    );
    return [];
  }

  if (productRelationsData.error) {
    logger.error(
      `Error during the GraphqlAPI call (productRelationsData): ${productRelationsData.error.message}`,
      {
        error: productRelationsData.error,
      },
    );
    return [];
  }

  const variantEdges = basicProductData.data?.productVariants?.edges || [];

  const productVariants = variantEdges
    .map((e) => {
      const attributesEdge = productAttributesData.data?.productVariants?.edges.find(
        (attr) => attr.node.id === e.node.id,
      );
      const relationsEdge = productRelationsData.data?.productVariants?.edges.find(
        (rel) => rel.node.id === e.node.id,
      );
      const attributes = attributesEdge?.node.attributes;
      const product = relationsEdge?.node.product;

      if (!attributes || !product) {
        return null;
      }

      return {
        ...e.node,
        attributes,
        product,
      };
    })
    .filter((e) => e !== null);

  if (productVariants.length !== variantEdges.length) {
    logger.warn("Some product variants were not fetched correctly");
    return [];
  }

  logger.debug("Product variants fetched successfully", {
    first: productVariants[0],
    totalLength: productVariants.length,
  });

  return productVariants;
};

interface FetchProductDataArgs {
  client: Client;
  channel: string;
  cursors?: Array<string>;
  imageSize?: number;
}

export const fetchProductData = async ({
  client,
  channel,
  cursors,
  imageSize,
}: FetchProductDataArgs) => {
  const logger = createLogger("fetchProductData", {
    saleorApiUrl: url,
    channel,
    route: "Google Product Feed",
  });

  logger.debug(`Fetching product data for channel ${channel}`);

  const cachedCursors = cursors || (await getCursors({ client, channel }));

  const pageCursors = [undefined, ...cachedCursors];

  logger.debug(`Query generated ${pageCursors.length} cursors`);

  const promises = pageCursors.map((cursor) =>
    fetchVariants({ client, after: cursor, channel, imageSize }),
  );

  const results = (await Promise.all(promises)).flat();

  logger.debug("Product data fetched successfully", {
    first: results[0],
    totalLength: results.length,
  });

  return results;
};
