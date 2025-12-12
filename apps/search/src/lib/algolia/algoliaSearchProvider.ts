import Algoliasearch, { SearchClient } from "algoliasearch";

import {
  ProductVariantWebhookPayloadFragment,
  ProductWebhookPayloadFragment,
} from "../../../generated/graphql";
import { ALGOLIA_TIMEOUT_MS } from "../algolia-timeouts";
import { isNotNil } from "../isNotNil";
import { createLogger } from "../logger";
import { SearchProvider } from "../searchProvider";
import { createTraceEffect } from "../trace-effect";
import { ALGOLIA_SLOW_THRESHOLD_MS } from "../trace-effect-thresholds";
import {
  AlgoliaObject,
  channelListingToAlgoliaIndexId,
  productAndVariantToAlgolia,
  productAndVariantToObjectID,
} from "./algoliaUtils";

export interface AlgoliaSearchProviderOptions {
  appId: string;
  apiKey: string;
  indexNamePrefix?: string;
  channels?: Array<{ slug: string; currencyCode: string }>;
  enabledKeys: string[];
}

const logger = createLogger("AlgoliaSearchProvider");

export class AlgoliaSearchProvider implements SearchProvider {
  #algolia: SearchClient;
  #indexNamePrefix?: string | undefined;
  #indexNames: Array<string>;
  #enabledKeys: string[];

  #traceSaveObjects = createTraceEffect({
    name: "Algolia saveObjects",
    slowThresholdMs: ALGOLIA_SLOW_THRESHOLD_MS,
  });
  #traceDeleteObjects = createTraceEffect({
    name: "Algolia deleteObjects",
    slowThresholdMs: ALGOLIA_SLOW_THRESHOLD_MS,
  });
  #traceSetSettings = createTraceEffect({
    name: "Algolia setSettings",
    slowThresholdMs: ALGOLIA_SLOW_THRESHOLD_MS,
  });
  #traceDeleteBy = createTraceEffect({
    name: "Algolia deleteBy",
    slowThresholdMs: ALGOLIA_SLOW_THRESHOLD_MS,
  });

  constructor({
    appId,
    apiKey,
    indexNamePrefix,
    channels,
    enabledKeys,
  }: AlgoliaSearchProviderOptions) {
    this.#algolia = Algoliasearch(appId, apiKey); // cspell:disable-line
    this.#indexNamePrefix = indexNamePrefix;
    this.#indexNames =
      channels?.map((c) => channelListingToAlgoliaIndexId({ channel: c }, this.#indexNamePrefix)) ||
      [];
    this.#enabledKeys = enabledKeys;
  }

  private async saveGroupedByIndex(groupedByIndex: GroupedByIndex) {
    logger.debug("saveGroupedByIndex called");

    return Promise.all(
      Object.entries(groupedByIndex).map(([indexName, objects]) => {
        const index = this.#algolia.initIndex(indexName);

        return this.#traceSaveObjects(
          () => index.saveObjects(objects, { timeout: ALGOLIA_TIMEOUT_MS }),
          { indexName, objectsCount: objects.length },
        );
      }),
    );
  }

  private async deleteGroupedByIndex(groupedByIndex: IdsGroupedByIndex) {
    logger.debug("deleteGroupedByIndex called");

    return Promise.all(
      Object.entries(groupedByIndex).map(([indexName, objectIds]) => {
        const index = this.#algolia.initIndex(indexName);

        return this.#traceDeleteObjects(
          () => index.deleteObjects(objectIds, { timeout: ALGOLIA_TIMEOUT_MS }),
          { indexName, objectIdsCount: objectIds.length },
        );
      }),
    );
  }

  async updateIndicesSettings() {
    logger.debug(`updateIndicesSettings called`);
    await Promise.all(
      this.#indexNames.map(async (indexName) => {
        const index = this.#algolia.initIndex(indexName);

        return this.#traceSetSettings(
          () =>
            index.setSettings({
              attributesForFaceting: [
                "productId",
                "inStock",
                "categories",
                "attributes",
                "collections",
                "pricing.price.net",
                "pricing.price.gross",
                "pricing.discount.net",
                "pricing.discount.gross",
                "pricing.priceUndiscounted.net",
                "pricing.priceUndiscounted.gross",
                "pricing.onSale",
              ],
              attributeForDistinct: "productId",
              numericAttributesForFiltering: ["grossPrice"],
              distinct: true,
              searchableAttributes: [
                "name",
                "productName",
                "variantName",
                "productType",
                "category",
                "descriptionPlaintext",
                "collections",
              ],
            }),
          { indexName },
        );
      }),
    );
  }

  async updatedBatchProducts(productsBatch: ProductWebhookPayloadFragment[]) {
    logger.debug(`updatedBatchProducts called`);

    const groupedByIndex = groupProductsByIndexName(productsBatch, {
      visibleInListings: true,
      indexNamePrefix: this.#indexNamePrefix,
      enabledKeys: this.#enabledKeys,
    });

    await this.saveGroupedByIndex(groupedByIndex);
  }

  async createProduct(product: ProductWebhookPayloadFragment) {
    logger.debug(`createProduct called`);
    await this.updateProduct(product);
  }

  async updateProduct(product: ProductWebhookPayloadFragment) {
    logger.debug(`updateProduct called`);

    if (!product.variants) {
      logger.debug("Product has no variants - abort");

      return;
    }
    await Promise.all(product.variants.map((variant) => this.updateProductVariant(variant)));
  }

  async deleteProduct(product: ProductWebhookPayloadFragment) {
    logger.debug(`deleteProduct`);

    await Promise.all(
      this.#indexNames.map((indexName) => {
        const index = this.#algolia.initIndex(indexName);

        return this.#traceDeleteBy(
          () =>
            index.deleteBy(
              { filters: `productId:"${product.id}"` },
              { timeout: ALGOLIA_TIMEOUT_MS },
            ),
          { indexName, productId: product.id },
        );
      }),
    );
  }

  async createProductVariant(productVariant: ProductVariantWebhookPayloadFragment) {
    logger.debug(`createProductVariant called`);

    return this.updateProductVariant(productVariant);
  }

  async updateProductVariant(productVariant: ProductVariantWebhookPayloadFragment) {
    logger.debug(`updateProductVariant called`);

    const groupedByIndexToSave = groupVariantByIndexName(productVariant, {
      visibleInListings: true,
      indexNamePrefix: this.#indexNamePrefix,
      enabledKeys: this.#enabledKeys,
    });

    if (groupedByIndexToSave && !!Object.keys(groupedByIndexToSave).length) {
      await this.saveGroupedByIndex(groupedByIndexToSave);
    }

    /*
     * When the variant is removed from a channel, Saleor does not send it's channel listing in the event payload.
     * If it was created previously, we have to remove it.
     * To achieve that we call delete operation for every index which wasn't updated.
     */
    const staleIndices = this.#indexNames.filter(
      (name) => !Object.keys(groupedByIndexToSave || {}).includes(name),
    );

    if (staleIndices) {
      await this.deleteGroupedByIndex(
        Object.fromEntries(
          staleIndices.map((index) => [index, [productAndVariantToObjectID(productVariant)]]),
        ),
      );
    }
  }

  async deleteProductVariant(productVariant: ProductVariantWebhookPayloadFragment) {
    logger.debug(`deleteProductVariant called`);

    await this.deleteGroupedByIndex(
      Object.fromEntries(
        this.#indexNames.map((index) => [index, [productAndVariantToObjectID(productVariant)]]),
      ),
    );
  }
}

type GroupedByIndex = Record<string, AlgoliaObject[]>;
type IdsGroupedByIndex = Record<string, Array<string>>;

const groupVariantByIndexName = (
  productVariant: ProductVariantWebhookPayloadFragment,
  {
    visibleInListings,
    indexNamePrefix,
    enabledKeys,
  }: {
    visibleInListings: true | false | null;
    indexNamePrefix: string | undefined;
    enabledKeys: string[];
  },
) => {
  logger.debug("Grouping variants per index name");
  if (!productVariant.channelListings) {
    logger.debug("Product variant has no channel listings - abort");

    return {};
  }

  const objectsToSaveByIndexName = productVariant.channelListings
    .filter((channelListing) => {
      const productChannelListing = productVariant.product.channelListings?.find(
        (productChannelListing) =>
          productChannelListing.channel.slug === channelListing.channel.slug,
      );

      if (!productChannelListing) {
        logger.debug("no product channel listing found - abort", {
          var: channelListing,
          prod: productChannelListing,
        });

        return false;
      }

      // don't filter if `visibleInListings` is null
      return visibleInListings === null
        ? true
        : productChannelListing.visibleInListings === visibleInListings;
    })
    .map((channelListing) => {
      const object = productAndVariantToAlgolia({
        variant: productVariant,
        channel: channelListing.channel.slug,
        enabledKeys,
      });

      return {
        object,
        indexName: channelListingToAlgoliaIndexId(channelListing, indexNamePrefix),
      };
    })
    .reduce((acc, { object, indexName }) => {
      acc[indexName] = acc[indexName] ?? [];
      acc[indexName].push(object);

      return acc;
    }, {} as GroupedByIndex);

  return objectsToSaveByIndexName;
};

const groupProductsByIndexName = (
  productsBatch: ProductWebhookPayloadFragment[],
  {
    visibleInListings,
    indexNamePrefix,
    enabledKeys,
  }: {
    visibleInListings: true | false | null;
    indexNamePrefix: string | undefined;
    enabledKeys: string[];
  },
) => {
  logger.debug(`groupProductsByIndexName called`);
  const batchesAndIndices = productsBatch
    .flatMap((p) => p.variants)
    .filter(isNotNil)
    .map((p) => groupVariantByIndexName(p, { visibleInListings, indexNamePrefix, enabledKeys }))
    .filter(isNotNil)
    .flatMap((x) => Object.entries(x));

  const groupedByIndex = batchesAndIndices.reduce((acc, [indexName, objects]) => {
    acc[indexName] = acc[indexName] ?? [];
    acc[indexName].push(...objects);

    return acc;
  }, {} as GroupedByIndex);

  return groupedByIndex;
};
