import Algoliasearch, { type SearchClient } from "algoliasearch";
import { z } from "zod";

import {
  type CategoryDataFragment,
  type PageDataFragment,
  type ProductVariantWebhookPayloadFragment,
  type ProductWebhookPayloadFragment,
} from "../../../generated/graphql";
import { env } from "../../env";
import { isNotNil } from "../isNotNil";
import { createLogger } from "../logger";
import { type SearchProvider } from "../searchProvider";
import { createTraceEffect } from "../trace-effect";
import { ALGOLIA_SLOW_THRESHOLD_MS } from "../trace-effect-thresholds";
import { AlgoliaInvalidAppIdError } from "./algolia-errors";
import {
  type AlgoliaObject,
  channelListingToAlgoliaIndexId,
  productAndVariantToAlgolia,
  productAndVariantToObjectID,
} from "./algoliaUtils";
import { categoryToAlgolia, categoryToAlgoliaIndexId } from "./categoryAlgoliaUtils";
import { pageToAlgolia, pageToAlgoliaIndexId } from "./pageAlgoliaUtils";

const algoliaRetryErrorShape = z.object({
  name: z.literal("RetryError"),
  message: z.string(),
});

function rethrowKnownErrors(error: unknown): never {
  const parsed = algoliaRetryErrorShape.safeParse(error);

  if (parsed.success && /Unreachable hosts/.test(parsed.data.message)) {
    throw new AlgoliaInvalidAppIdError("Algolia Application ID does not exist or is unreachable", {
      cause: error,
    });
  }

  throw error;
}

export interface AlgoliaSearchProviderOptions {
  appId: string;
  apiKey: string;
  indexNamePrefix?: string;
  channels?: Array<{ slug: string; currencyCode: string }>;
  enabledKeys: string[];
  pageEnabledKeys: string[];
}

const logger = createLogger("AlgoliaSearchProvider");

export class AlgoliaSearchProvider implements SearchProvider {
  #algolia: SearchClient;
  #indexNamePrefix?: string | undefined;
  #indexNames: Array<string>;
  #categoryIndexName: string;
  #pageIndexName: string;
  #enabledKeys: string[];
  #pageEnabledKeys: string[];

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
    pageEnabledKeys,
  }: AlgoliaSearchProviderOptions) {
    this.#algolia = Algoliasearch(appId, apiKey); // cspell:disable-line
    this.#indexNamePrefix = indexNamePrefix;
    this.#indexNames =
      channels?.map((c) => channelListingToAlgoliaIndexId({ channel: c }, this.#indexNamePrefix)) ||
      [];
    this.#categoryIndexName = categoryToAlgoliaIndexId(this.#indexNamePrefix);
    this.#pageIndexName = pageToAlgoliaIndexId(this.#indexNamePrefix);
    this.#enabledKeys = enabledKeys;
    this.#pageEnabledKeys = pageEnabledKeys;
  }

  private async saveGroupedByIndex(groupedByIndex: GroupedByIndex) {
    logger.debug("saveGroupedByIndex called");

    return Promise.all(
      Object.entries(groupedByIndex).map(([indexName, objects]) => {
        const index = this.#algolia.initIndex(indexName);

        return this.#traceSaveObjects(
          () => index.saveObjects(objects, { timeout: env.NEXT_PUBLIC_ALGOLIA_TIMEOUT_MS }),
          { indexName, objectsCount: objects.length },
        ).catch(rethrowKnownErrors);
      }),
    );
  }

  private async deleteGroupedByIndex(groupedByIndex: IdsGroupedByIndex) {
    logger.debug("deleteGroupedByIndex called");

    return Promise.all(
      Object.entries(groupedByIndex).map(([indexName, objectIds]) => {
        const index = this.#algolia.initIndex(indexName);

        return this.#traceDeleteObjects(
          () => index.deleteObjects(objectIds, { timeout: env.NEXT_PUBLIC_ALGOLIA_TIMEOUT_MS }),
          { indexName, objectIdsCount: objectIds.length },
        ).catch(rethrowKnownErrors);
      }),
    );
  }

  async updateIndicesSettings() {
    logger.debug(`updateIndicesSettings called`);
    await Promise.all([
      ...this.#indexNames.map((indexName) => this.#updateProductIndexSettings(indexName)),
      this.#updateCategoryIndexSettings(),
      this.#updatePageIndexSettings(),
    ]);
  }

  async #updateProductIndexSettings(indexName: string) {
    const index = this.#algolia.initIndex(indexName);

    return this.#traceSetSettings(
      () =>
        index.setSettings({
          attributesForFaceting: [
            "productId",
            "inStock",
            "categories",
            "categoryId",
            "categorySlug",
            "productTypeId",
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
            "productTypeId",
            "category",
            "descriptionPlaintext",
            "collections",
          ],
        }),
      { indexName },
    ).catch(rethrowKnownErrors);
  }

  async #updateCategoryIndexSettings() {
    return this.#traceSetSettings(
      () =>
        this.#algolia.initIndex(this.#categoryIndexName).setSettings({
          attributesForFaceting: ["level", "ancestors", "metadata"],
          searchableAttributes: ["name", "slug", "ancestors"],
        }),
      { indexName: this.#categoryIndexName },
    ).catch(rethrowKnownErrors);
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

  async deleteProduct(product: Pick<ProductWebhookPayloadFragment, "id">) {
    logger.debug(`deleteProduct`);

    await Promise.all(
      this.#indexNames.map((indexName) => {
        const index = this.#algolia.initIndex(indexName);

        return this.#traceDeleteBy(
          () =>
            index.deleteBy(
              { filters: `productId:"${product.id}"` },
              { timeout: env.NEXT_PUBLIC_ALGOLIA_TIMEOUT_MS },
            ),
          { indexName, productId: product.id },
        ).catch(rethrowKnownErrors);
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

  async deleteProductVariant(productVariant: { id: string; product: { id: string } }) {
    logger.debug(`deleteProductVariant called`);

    await this.deleteGroupedByIndex(
      Object.fromEntries(
        this.#indexNames.map((index) => [index, [productAndVariantToObjectID(productVariant)]]),
      ),
    );
  }

  async createCategory(category: CategoryDataFragment) {
    logger.debug(`createCategory called`);
    await this.updateCategory(category);
  }

  async updateCategory(category: CategoryDataFragment) {
    logger.debug(`updateCategory called`);

    const algoliaObject = categoryToAlgolia(category);
    const index = this.#algolia.initIndex(this.#categoryIndexName);

    await this.#traceSaveObjects(
      () => index.saveObjects([algoliaObject], { timeout: env.NEXT_PUBLIC_ALGOLIA_TIMEOUT_MS }),
      { indexName: this.#categoryIndexName, objectsCount: 1 },
    ).catch(rethrowKnownErrors);
  }

  async deleteCategory(categoryId: string) {
    logger.debug(`deleteCategory called`);

    const index = this.#algolia.initIndex(this.#categoryIndexName);

    await this.#traceDeleteObjects(
      () => index.deleteObjects([categoryId], { timeout: env.NEXT_PUBLIC_ALGOLIA_TIMEOUT_MS }),
      { indexName: this.#categoryIndexName, objectIdsCount: 1 },
    ).catch(rethrowKnownErrors);
  }

  async updatedBatchCategories(categoriesBatch: CategoryDataFragment[]) {
    logger.debug(`updatedBatchCategories called`);

    const algoliaObjects = categoriesBatch.map(categoryToAlgolia);
    const index = this.#algolia.initIndex(this.#categoryIndexName);

    await this.#traceSaveObjects(
      () => index.saveObjects(algoliaObjects, { timeout: env.NEXT_PUBLIC_ALGOLIA_TIMEOUT_MS }),
      { indexName: this.#categoryIndexName, objectsCount: algoliaObjects.length },
    ).catch(rethrowKnownErrors);
  }

  async createPage(page: PageDataFragment) {
    logger.debug(`createPage called`);
    await this.updatePage(page);
  }

  async updatePage(page: PageDataFragment) {
    logger.debug(`updatePage called`);

    const algoliaObject = pageToAlgolia(page, this.#pageEnabledKeys);
    const index = this.#algolia.initIndex(this.#pageIndexName);

    await this.#traceSaveObjects(
      () => index.saveObjects([algoliaObject], { timeout: env.NEXT_PUBLIC_ALGOLIA_TIMEOUT_MS }),
      { indexName: this.#pageIndexName, objectsCount: 1 },
    ).catch(rethrowKnownErrors);
  }

  async deletePage(pageId: string) {
    logger.debug(`deletePage called`);

    const index = this.#algolia.initIndex(this.#pageIndexName);

    await this.#traceDeleteObjects(
      () => index.deleteObjects([pageId], { timeout: env.NEXT_PUBLIC_ALGOLIA_TIMEOUT_MS }),
      { indexName: this.#pageIndexName, objectIdsCount: 1 },
    ).catch(rethrowKnownErrors);
  }

  async updatedBatchPages(pagesBatch: PageDataFragment[]) {
    logger.debug(`updatedBatchPages called`);

    const algoliaObjects = pagesBatch.map((page) => pageToAlgolia(page, this.#pageEnabledKeys));
    const index = this.#algolia.initIndex(this.#pageIndexName);

    await this.#traceSaveObjects(
      () => index.saveObjects(algoliaObjects, { timeout: env.NEXT_PUBLIC_ALGOLIA_TIMEOUT_MS }),
      { indexName: this.#pageIndexName, objectsCount: algoliaObjects.length },
    ).catch(rethrowKnownErrors);
  }

  async #updatePageIndexSettings() {
    return this.#traceSetSettings(
      () =>
        this.#algolia.initIndex(this.#pageIndexName).setSettings({
          attributesForFaceting: ["pageTypeId", "metadata", "attributes"],
          searchableAttributes: ["title", "slug", "seoTitle", "contentPlaintext"],
        }),
      { indexName: this.#pageIndexName },
    ).catch(rethrowKnownErrors);
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
