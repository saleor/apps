import Algoliasearch, { SearchClient } from "algoliasearch";
import {
  ProductVariantWebhookPayloadFragment,
  ProductWebhookPayloadFragment,
} from "../../../generated/graphql";
import { isNotNil } from "../isNotNil";
import { SearchProvider } from "../searchProvider";
import {
  AlgoliaObject,
  channelListingToAlgoliaIndexId,
  productAndVariantToAlgolia,
  productAndVariantToObjectID,
} from "./algoliaUtils";
import { createLogger } from "../logger";

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

  constructor({
    appId,
    apiKey,
    indexNamePrefix,
    channels,
    enabledKeys,
  }: AlgoliaSearchProviderOptions) {
    this.#algolia = Algoliasearch(appId, apiKey);
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

        return index.saveObjects(objects);
      }),
    );
  }

  private async deleteGroupedByIndex(groupedByIndex: IdsGroupedByIndex) {
    logger.debug("deleteGroupedByIndex called");

    return Promise.all(
      Object.entries(groupedByIndex).map(([indexName, objects]) => {
        const index = this.#algolia.initIndex(indexName);

        return index.deleteObjects(objects);
      }),
    );
  }

  async updateIndicesSettings() {
    logger.debug(`updateIndicesSettings called`);
    await Promise.all(
      this.#indexNames.map(async (indexName) => {
        const index = this.#algolia.initIndex(indexName);

        return index.setSettings({
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
        });
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

        return index.deleteBy({ filters: `productId:"${product.id}"` });
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

  async ping() {
    return this.#algolia
      .listIndices()
      .then(() => undefined)
      .catch((r) => {
        if (r.status === 403) {
          throw new Error("Algolia responded with invalid credentials");
        }
      });
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
        logger.debug(
          { var: channelListing, prod: productChannelListing },
          "no product channel listing found - abort",
        );
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
