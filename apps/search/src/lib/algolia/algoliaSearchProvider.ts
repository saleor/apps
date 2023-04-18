import Algoliasearch, { SearchClient } from "algoliasearch";
import {
  ProductVariantWebhookPayloadFragment,
  ProductWebhookPayloadFragment,
} from "../../../generated/graphql";
import { isNotNil } from "../isNotNil";
import { SearchProvider } from "../searchProvider";
import { createDebug } from "../debug";
import {
  AlgoliaObject,
  channelListingToAlgoliaIndexId,
  productAndVariantToAlgolia,
} from "./algoliaUtils";

export interface AlgoliaSearchProviderOptions {
  appId: string;
  apiKey: string;
  indexNamePrefix?: string;
}

const debug = createDebug("AlgoliaSearchProvider");

export class AlgoliaSearchProvider implements SearchProvider {
  #algolia: SearchClient;
  #indexNamePrefix?: string | undefined;

  constructor({ appId, apiKey, indexNamePrefix }: AlgoliaSearchProviderOptions) {
    this.#algolia = Algoliasearch(appId, apiKey);
    this.#indexNamePrefix = indexNamePrefix;
  }

  private async saveGroupedByIndex(groupedByIndex: GroupedByIndex) {
    debug("saveGroupedByIndex called");
    return Promise.all(
      Object.entries(groupedByIndex).map(([indexName, objects]) => {
        const index = this.#algolia.initIndex(indexName);

        return index.saveObjects(objects);
      })
    );
  }

  private async deleteGroupedByIndex(groupedByIndex: GroupedByIndex) {
    debug("deleteGroupedByIndex called");

    return Promise.all(
      Object.entries(groupedByIndex).map(([indexName, objects]) => {
        const index = this.#algolia.initIndex(indexName);

        return index.deleteObjects(objects.map((o) => o.objectID));
      })
    );
  }

  async updatedBatchProducts(productsBatch: ProductWebhookPayloadFragment[]) {
    debug(`updatedBatchProducts called`);

    const groupedByIndex = groupProductsByIndexName(productsBatch, {
      visibleInListings: true,
      indexNamePrefix: this.#indexNamePrefix,
    });

    await this.saveGroupedByIndex(groupedByIndex);
  }

  async createProduct(product: ProductWebhookPayloadFragment) {
    debug(`createProduct called`);
    await this.updateProduct(product);
  }

  async updateProduct(product: ProductWebhookPayloadFragment) {
    debug(`updateProduct called`);

    if (!product.variants) {
      debug("Product has no variants - abort");
      return;
    }
    await Promise.all(product.variants.map((variant) => this.updateProductVariant(variant)));
  }

  async deleteProduct(product: ProductWebhookPayloadFragment) {
    debug(`deleteProduct`);
    if (!product.variants) {
      debug("Product has no variants - abort");
      return;
    }
    await Promise.all(product.variants.map((variant) => this.deleteProductVariant(variant)));
  }

  async createProductVariant(productVariant: ProductVariantWebhookPayloadFragment) {
    debug(`createProductVariant called`);
    return this.updateProductVariant(productVariant);
  }

  async updateProductVariant(productVariant: ProductVariantWebhookPayloadFragment) {
    debug(`updateProductVariant called`);

    if (!productVariant.product.channelListings) {
      debug("Product has no channelListings - abort");
      return;
    }

    const groupedByIndexToSave = groupVariantByIndexName(productVariant, {
      visibleInListings: true,
      indexNamePrefix: this.#indexNamePrefix,
    });

    if (groupedByIndexToSave && !!Object.keys(groupedByIndexToSave).length) {
      await this.saveGroupedByIndex(groupedByIndexToSave);
    }

    const groupedByIndexToDelete = groupVariantByIndexName(productVariant, {
      visibleInListings: false,
      indexNamePrefix: this.#indexNamePrefix,
    });

    if (groupedByIndexToDelete && !!Object.keys(groupedByIndexToDelete).length) {
      await this.deleteGroupedByIndex(groupedByIndexToDelete);
    }
  }

  async deleteProductVariant(productVariant: ProductVariantWebhookPayloadFragment) {
    debug(`deleteProductVariant called`);

    if (!productVariant.product.channelListings) {
      debug("No channel listing data - return");
      return;
    }

    const groupedByIndexToDelete = groupVariantByIndexName(productVariant, {
      visibleInListings: null,
      indexNamePrefix: this.#indexNamePrefix,
    });

    if (groupedByIndexToDelete) {
      await this.deleteGroupedByIndex(groupedByIndexToDelete);
    }
  }
}

type GroupedByIndex = Record<string, AlgoliaObject[]>;

const groupVariantByIndexName = (
  productVariant: ProductVariantWebhookPayloadFragment,
  {
    visibleInListings,
    indexNamePrefix,
  }: { visibleInListings: true | false | null; indexNamePrefix: string | undefined }
) => {
  if (!productVariant.product.channelListings) {
    return null;
  }

  const objectsToSaveByIndexName = productVariant.product.channelListings
    .filter((channelListing) =>
      // don't filter if `visibleInListings` is null
      visibleInListings === null ? true : channelListing.visibleInListings === visibleInListings
    )
    .map((channelListing) => {
      const object = productAndVariantToAlgolia({
        variant: productVariant,
        channel: channelListing.channel.slug,
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
  }: { visibleInListings: true | false | null; indexNamePrefix: string | undefined }
) => {
  debug(`groupProductsByIndexName called`);
  const batchesAndIndices = productsBatch
    .flatMap((p) => p.variants)
    .filter(isNotNil)
    .map((p) => groupVariantByIndexName(p, { visibleInListings, indexNamePrefix }))
    .filter(isNotNil)
    .flatMap((x) => Object.entries(x));
  const groupedByIndex = batchesAndIndices.reduce((acc, [indexName, objects]) => {
    acc[indexName] = acc[indexName] ?? [];
    acc[indexName].push(...objects);
    return acc;
  }, {} as GroupedByIndex);

  return groupedByIndex;
};
