import { Client } from "typesense";
import {
  ProductVariantWebhookPayloadFragment,
  ProductWebhookPayloadFragment,
} from "../../../generated/graphql";
import { isNotNil } from "../isNotNil";
import { SearchProvider } from "../searchProvider";
import {
  TypesenseObject,
  channelListingToTypesenseIndexId,
  productAndVariantToTypesense,
  productAndVariantToObjectID,
  getDefaultFieldValue,
} from "./typesenseUtils";
import { createLogger } from "../logger";
import { TypesenseRootFields, requiredFields } from "../typesense-fields";
import { FieldType } from "typesense/lib/Typesense/Collection";

export interface TypesenseSearchProviderOptions {
  host: string;
  port: number;
  protocol: string;
  apiKey: string;
  connectionTimeoutSeconds: number;
  indexNamePrefix?: string;
  channels?: Array<{ slug: string; currencyCode: string }>;
  enabledKeys: string[];
}

type Field = {
  name: string;
  type: FieldType;
  optional?: boolean;
  facet?: boolean;
};

const logger = createLogger("TypesenseSearchProvider");

export class TypesenseSearchProvider implements SearchProvider {
  #typesense: Client;
  #indexNamePrefix?: string | undefined;
  #indexNames: Array<string>;
  #enabledKeys: string[];

  constructor({
    host,
    port,
    protocol,
    apiKey,
    connectionTimeoutSeconds,
    indexNamePrefix,
    channels,
    enabledKeys,
  }: TypesenseSearchProviderOptions) {
    this.#typesense = new Client({
      nodes: [
        {
          host,
          protocol,
          port,
        },
      ],
      apiKey,
      connectionTimeoutSeconds,
    });
    this.#indexNamePrefix = indexNamePrefix;
    this.#indexNames =
      channels?.map((c) =>
        channelListingToTypesenseIndexId({ channel: c }, this.#indexNamePrefix),
      ) || [];
    this.#enabledKeys = enabledKeys;
  }

  // Method to check if the collection exists in Typesense
  async #collectionExists(collectionName: string) {
    return this.#typesense.collections(collectionName).exists();
  }

  // Method to create a collection in Typesense
  async #createCollection(collectionName: string) {
    return this.#typesense.collections().create({
      name: collectionName,
      enable_nested_fields: true,
      fields: requiredFields as Field[],
    });
  }

  // Method to update a collection in Typesense
  async #updateCollection(collectionName: string, fields: Field[], defaultSortingField: string) {
    return this.#typesense.collections(collectionName).update({
      default_sorting_field: defaultSortingField,
      fields: fields,
    });
  }

  // Method to delete a document from a collection in Typesense
  async #deleteDocument(collectionName: string, documentId: string) {
    logger.debug(`Deleting document with ID: ${documentId} from collection: ${collectionName}`);
    return this.#typesense.collections(collectionName).documents(documentId).delete();
  }

  // Method to filter out keys that are not enabled in the configuration
  async #filterEnabledKeys(objects: any[]) {
    return objects.map((object) => {
      return Object.fromEntries(
        Object.entries(object)
          .filter(([key]) => this.#enabledKeys.includes(key))
          .concat([["id", `${object.productId}_${object.variantId}`]])
          .map(([key, value]) => {
            if (key === "grossPrice") {
              return [key, Math.round(parseFloat(value as unknown as string) * 100)];
            }
            // If any key is present in enabledKeys but not present in object, create empty value
            if (!value && this.#enabledKeys.includes(key)) {
              return [key, getDefaultFieldValue(key as TypesenseRootFields)];
            }
            return [key, value];
          }),
      );
    });
  }

  // Method to import documents to a collection in Typesense from an array of objects
  async #importDocuments(collectionName: string, documents: any[]) {
    logger.debug(`Importing ${documents.length} documents to collection: ${collectionName}`);
    const filteredDocuments = documents.map((doc) => {
      const filteredDoc: any = {};

      this.#enabledKeys.forEach((key) => {
        filteredDoc[key] = doc[key] ?? getDefaultFieldValue(key as TypesenseRootFields);
      });
      filteredDoc.id = doc.id;
      return filteredDoc;
    });

    return this.#typesense.collections(collectionName).documents().import(filteredDocuments, {
      action: "upsert",
    });
  }

  // Method to save documents grouped by index name
  async #saveGroupedByIndex(groupedByIndex: GroupedByIndex) {
    logger.debug("saveGroupedByIndex called", { groupedByIndex });
    return Promise.all(
      Object.entries(groupedByIndex).map(async ([indexName, objects]) => {
        logger.debug("Processing index:", { indexName, objectsCount: objects.length });
        // First check if the collection exists, if not create it
        const collectionExists = await this.#collectionExists(indexName);

        // If the collection does not exist, create it
        if (!collectionExists) {
          await this.#createCollection(indexName);
        }
        logger.debug("Importing documents to index:", { indexName, objects });
        try {
          // Filter out keys that are not enabled in the configuration
          const filteredObjectsByKeys = await this.#filterEnabledKeys(objects);
          // Import the documents to the index
          const result = await this.#importDocuments(indexName, filteredObjectsByKeys);

          logger.debug("Import result:", { indexName, result });
        } catch (error: any) {
          logger.error(`Failed to import documents: ${error.message}`, { error });
          throw error;
        }
      }),
    );
  }

  // Method to delete documents grouped by index name
  async #deleteGroupedByIndex(groupedByIndex: IdsGroupedByIndex) {
    logger.debug("deleteGroupedByIndex called", { groupedByIndex });

    return Promise.all(
      Object.entries(groupedByIndex).map(async ([indexName, objects]) => {
        logger.debug("Processing index for deletion:", { indexName, objects });

        for (const objectId of objects) {
          if (isNotNil(objectId)) {
            logger.debug("Deleting document:", { objectId });
            try {
              const result = await this.#deleteDocument(indexName, objectId);

              logger.debug("Delete result:", { indexName, result });
            } catch (error: any) {
              logger.error(`Failed to delete document: ${error.message}`, { error });
              throw error;
            }
          }
        }
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

    await this.#saveGroupedByIndex(groupedByIndex);
  }

  // Method to create a product in Typesense
  async createProduct(product: ProductWebhookPayloadFragment) {
    logger.debug(`createProduct called`, { product });
    await this.updateProduct(product);
  }

  // Method to update a product in Typesense
  async updateProduct(product: ProductWebhookPayloadFragment) {
    logger.debug(`updateProduct called`);

    if (!product.variants) {
      logger.debug("Product has no variants - abort");
      return;
    }
    await Promise.all(product.variants.map((variant) => this.updateProductVariant(variant)));
  }

  // Method to delete a product from Typesense
  async deleteProduct(product: ProductWebhookPayloadFragment) {
    logger.debug(`deleteProduct called`, { product });

    await Promise.all(
      this.#indexNames.map(async (indexName) => {
        try {
          /*
           * This approach is not optimal, but only way that Typesense supports deleting products is
           * by id and product id is in form of "productId_variantId" because of duplications.
           * So we need to get all products from index, find all products and delete the ones that match the product id.
           */
          const allProductsString = await this.#typesense
            .collections(indexName)
            .documents()
            .export();

          // Typesense export returns a string with each document on a new line
          let validJson = "[" + allProductsString.replace(/\n/g, ",") + "]";
          let products = JSON.parse(validJson);
          let productIds = products.map((product: any) => product.id);

          for (const productId of productIds) {
            try {
              const result = await this.#deleteDocument(indexName, productId);

              logger.debug("Delete result:", { indexName, productId, result });
            } catch (error: any) {
              if (error.httpStatus === 404) {
                logger.warn(`Document not found for deletion with productId: ${productId}`, {
                  error,
                });
              } else {
                logger.error(
                  `Failed to delete variants with productId: ${productId}: ${error.message}`,
                  { error },
                );
                throw error; // Re-throw the error if it's not a 404
              }
            }
          }
        } catch (error) {
          console.error(`Error processing products from Typesense index ${indexName}:`, error);
        }
      }),
    );
  }

  // Method to create a product variant in Typesense
  async createProductVariant(productVariant: ProductVariantWebhookPayloadFragment) {
    logger.debug(`createProductVariant called`, { productVariant });
    await this.updateProductVariant(productVariant);
  }

  // Method to update a product variant in Typesense
  async updateProductVariant(productVariant: ProductVariantWebhookPayloadFragment) {
    logger.debug(`updateProductVariant called`, { productVariant });

    if (!productVariant || !productVariant.channelListings) {
      logger.error("Invalid product variant payload received", { productVariant });
      throw new Error("Invalid product variant payload");
    }

    const groupedByIndexToSave = groupVariantByIndexName(productVariant, {
      visibleInListings: true,
      indexNamePrefix: this.#indexNamePrefix,
      enabledKeys: this.#enabledKeys,
    });

    if (groupedByIndexToSave && !!Object.keys(groupedByIndexToSave).length) {
      logger.debug("Saving grouped index:", { groupedByIndexToSave });
      await this.#saveGroupedByIndex(groupedByIndexToSave);
    }

    const staleIndices = this.#indexNames.filter(
      (name) => !Object.keys(groupedByIndexToSave || {}).includes(name),
    );

    if (staleIndices) {
      logger.debug("Deleting stale indices:", { staleIndices });
      await this.#deleteGroupedByIndex(
        Object.fromEntries(
          staleIndices.map((index) => [index, [productAndVariantToObjectID(productVariant)]]),
        ),
      );
    }
  }

  // Method to delete a product variant from Typesense

  async deleteProductVariant(productVariant: ProductVariantWebhookPayloadFragment) {
    logger.debug(`deleteProductVariant called`, { productVariant });
    const compositeId = `${productVariant.product.id}_${productVariant.id}`;

    await this.#deleteGroupedByIndex(
      Object.fromEntries(this.#indexNames.map((index) => [index, [compositeId]])),
    );

    /*
     * await Promise.all(
     *   this.#indexNames.map(async (indexName) => {
     *     logger.debug("Deleting variant from index:", { indexName, compositeId });
     *     try {
     *       const result = await this.#deleteDocument(indexName, compositeId);
     *
     *       logger.debug("Delete result:", { indexName, compositeId, result });
     *     } catch (error: any) {
     *       logger.error(
     *         `Failed to delete variant with composite ID ${compositeId}: ${error.message}`,
     *         { error },
     *       );
     *       throw error; // This will propagate the error and reject the Promise.all
     *     }
     *   }),
     * );
     */
  }

  // Method to ping Typesense to check if it's up and running
  async ping() {
    return this.#typesense.health
      .retrieve()
      .then(() => undefined)
      .catch((r: any) => {
        if (r.status === 403) {
          throw new Error("Typesense responded with invalid credentials");
        }
      });
  }
}

type GroupedByIndex = Record<string, TypesenseObject[]>;
type IdsGroupedByIndex = Record<string, Array<string>>;

// Method to group variants by index name
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

  const objectsToSaveByIndexName: GroupedByIndex = {};

  productVariant.channelListings.forEach((channelListing) => {
    const productChannelListing = productVariant.product.channelListings?.find(
      (productChannelListing) => productChannelListing.channel.slug === channelListing.channel.slug,
    );

    if (!productChannelListing) {
      logger.debug("no product channel listing found - abort", {
        var: channelListing,
        prod: productChannelListing,
      });
      return;
    }

    if (
      visibleInListings !== null &&
      productChannelListing.visibleInListings !== visibleInListings
    ) {
      return;
    }

    const object = productAndVariantToTypesense({
      variant: productVariant,
      channel: channelListing.channel.slug,
      enabledKeys,
    });

    const indexName = channelListingToTypesenseIndexId(channelListing, indexNamePrefix);

    if (!objectsToSaveByIndexName[indexName]) {
      objectsToSaveByIndexName[indexName] = [];
    }

    objectsToSaveByIndexName[indexName].push(object);
  });

  return objectsToSaveByIndexName;
};

// Method to group products by index name
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

  const groupedByIndex: GroupedByIndex = {};

  productsBatch.forEach((product) => {
    product.variants?.forEach((variant) => {
      if (!variant) {
        return;
      }

      const groupedVariants = groupVariantByIndexName(variant, {
        visibleInListings,
        indexNamePrefix,
        enabledKeys,
      });

      for (const [indexName, objects] of Object.entries(groupedVariants)) {
        if (!groupedByIndex[indexName]) {
          groupedByIndex[indexName] = [];
        }

        groupedByIndex[indexName].push(...objects);
      }
    });
  });

  return groupedByIndex;
};
