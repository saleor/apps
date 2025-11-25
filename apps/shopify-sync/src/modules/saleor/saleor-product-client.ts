import { err, ok, Result } from "neverthrow";
import { Client } from "urql";

import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";

import {
  ADD_PRODUCTS_TO_COLLECTION_MUTATION,
  CREATE_ATTRIBUTE_MUTATION,
  CREATE_ATTRIBUTE_VALUE_MUTATION,
  CREATE_CATEGORY_MUTATION,
  CREATE_COLLECTION_MUTATION,
  CREATE_PRODUCT_MUTATION,
  CREATE_PRODUCT_TYPE_MUTATION,
  CREATE_PRODUCT_VARIANT_MUTATION,
  PRODUCT_CHANNEL_LISTING_UPDATE_MUTATION,
  PRODUCT_MEDIA_CREATE_MUTATION,
  PRODUCT_VARIANT_CHANNEL_LISTING_UPDATE_MUTATION,
  UPDATE_METADATA_MUTATION,
  UPDATE_PRODUCT_MUTATION,
  UPDATE_PRODUCT_VARIANT_MUTATION,
  UPDATE_PRODUCT_VARIANT_STOCKS_MUTATION,
} from "./graphql/mutations";
import {
  GET_ATTRIBUTES_QUERY,
  GET_CATEGORIES_QUERY,
  GET_CHANNELS_QUERY,
  GET_COLLECTIONS_QUERY,
  GET_PRODUCT_TYPES_QUERY,
  GET_PRODUCTS_QUERY,
  GET_WAREHOUSES_QUERY,
} from "./graphql/queries";
import {
  SaleorAttribute,
  SaleorCategory,
  SaleorChannel,
  SaleorCollection,
  SaleorProduct,
  SaleorProductCreateInput,
  SaleorProductsResponse,
  SaleorProductType,
  SaleorProductVariantCreateInput,
  SaleorWarehouse,
} from "./types";

const logger = createLogger("SaleorProductClient");

export const SaleorProductClientError = BaseError.subclass("SaleorProductClientError", {
  props: { _brand: "SaleorProductClientError" as const },
});

export type SaleorProductClientErrorType = InstanceType<typeof SaleorProductClientError>;

export class SaleorProductClient {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async getProducts(args: {
    first: number;
    after?: string;
    channel: string;
  }): Promise<Result<SaleorProductsResponse, SaleorProductClientErrorType>> {
    const result = await this.client.query(GET_PRODUCTS_QUERY, {
      first: args.first,
      after: args.after,
      channel: args.channel,
    });

    if (result.error) {
      logger.error("Failed to fetch products", { error: result.error });
      return err(
        new SaleorProductClientError("Failed to fetch products", {
          cause: result.error,
        })
      );
    }

    return ok(result.data as SaleorProductsResponse);
  }

  async getAllProducts(channel: string): Promise<Result<SaleorProduct[], SaleorProductClientErrorType>> {
    const allProducts: SaleorProduct[] = [];
    let hasNextPage = true;
    let cursor: string | undefined;

    while (hasNextPage) {
      const result = await this.getProducts({ first: 50, after: cursor, channel });

      if (result.isErr()) {
        return err(result.error);
      }

      const { products } = result.value;
      allProducts.push(...products.edges.map((edge) => edge.node));
      hasNextPage = products.pageInfo.hasNextPage;
      cursor = products.pageInfo.endCursor ?? undefined;
    }

    return ok(allProducts);
  }

  async getProductTypes(): Promise<Result<SaleorProductType[], SaleorProductClientErrorType>> {
    const result = await this.client.query(GET_PRODUCT_TYPES_QUERY, { first: 100 });

    if (result.error) {
      return err(new SaleorProductClientError("Failed to fetch product types", { cause: result.error }));
    }

    return ok(result.data.productTypes.edges.map((e: { node: SaleorProductType }) => e.node));
  }

  async getCategories(): Promise<Result<SaleorCategory[], SaleorProductClientErrorType>> {
    const result = await this.client.query(GET_CATEGORIES_QUERY, { first: 100 });

    if (result.error) {
      return err(new SaleorProductClientError("Failed to fetch categories", { cause: result.error }));
    }

    return ok(result.data.categories.edges.map((e: { node: SaleorCategory }) => e.node));
  }

  async getCollections(channel: string): Promise<Result<SaleorCollection[], SaleorProductClientErrorType>> {
    const result = await this.client.query(GET_COLLECTIONS_QUERY, { first: 100, channel });

    if (result.error) {
      return err(new SaleorProductClientError("Failed to fetch collections", { cause: result.error }));
    }

    return ok(result.data.collections.edges.map((e: { node: SaleorCollection }) => e.node));
  }

  async getChannels(): Promise<Result<SaleorChannel[], SaleorProductClientErrorType>> {
    const result = await this.client.query(GET_CHANNELS_QUERY, {});

    if (result.error) {
      return err(new SaleorProductClientError("Failed to fetch channels", { cause: result.error }));
    }

    return ok(result.data.channels);
  }

  async getWarehouses(): Promise<Result<SaleorWarehouse[], SaleorProductClientErrorType>> {
    const result = await this.client.query(GET_WAREHOUSES_QUERY, { first: 100 });

    if (result.error) {
      return err(new SaleorProductClientError("Failed to fetch warehouses", { cause: result.error }));
    }

    return ok(result.data.warehouses.edges.map((e: { node: SaleorWarehouse }) => e.node));
  }

  async getAttributes(): Promise<Result<SaleorAttribute[], SaleorProductClientErrorType>> {
    const result = await this.client.query(GET_ATTRIBUTES_QUERY, { first: 100 });

    if (result.error) {
      return err(new SaleorProductClientError("Failed to fetch attributes", { cause: result.error }));
    }

    return ok(result.data.attributes.edges.map((e: { node: SaleorAttribute }) => e.node));
  }

  async createProductType(input: {
    name: string;
    slug?: string;
    hasVariants?: boolean;
    productAttributes?: string[];
    variantAttributes?: string[];
  }): Promise<Result<{ id: string; name: string; slug: string }, SaleorProductClientErrorType>> {
    const result = await this.client.mutation(CREATE_PRODUCT_TYPE_MUTATION, { input });

    if (result.error) {
      return err(new SaleorProductClientError("Failed to create product type", { cause: result.error }));
    }

    const { productTypeCreate } = result.data;

    if (productTypeCreate.errors?.length > 0) {
      return err(
        new SaleorProductClientError("Product type creation failed", {
          props: { errors: productTypeCreate.errors },
        })
      );
    }

    return ok(productTypeCreate.productType);
  }

  async createAttribute(input: {
    name: string;
    slug?: string;
    type: "PRODUCT_TYPE" | "PAGE_TYPE";
    inputType: string;
    values?: Array<{ name: string }>;
  }): Promise<Result<{ id: string; name: string; slug: string }, SaleorProductClientErrorType>> {
    const result = await this.client.mutation(CREATE_ATTRIBUTE_MUTATION, { input });

    if (result.error) {
      return err(new SaleorProductClientError("Failed to create attribute", { cause: result.error }));
    }

    const { attributeCreate } = result.data;

    if (attributeCreate.errors?.length > 0) {
      return err(
        new SaleorProductClientError("Attribute creation failed", {
          props: { errors: attributeCreate.errors },
        })
      );
    }

    return ok(attributeCreate.attribute);
  }

  async createAttributeValue(
    attributeId: string,
    input: { name: string }
  ): Promise<Result<{ id: string; name: string; slug: string }, SaleorProductClientErrorType>> {
    const result = await this.client.mutation(CREATE_ATTRIBUTE_VALUE_MUTATION, {
      attributeId,
      input,
    });

    if (result.error) {
      return err(new SaleorProductClientError("Failed to create attribute value", { cause: result.error }));
    }

    const { attributeValueCreate } = result.data;

    if (attributeValueCreate.errors?.length > 0) {
      return err(
        new SaleorProductClientError("Attribute value creation failed", {
          props: { errors: attributeValueCreate.errors },
        })
      );
    }

    return ok(attributeValueCreate.attributeValue);
  }

  async createCategory(input: {
    name: string;
    slug?: string;
    parent?: string;
  }): Promise<Result<{ id: string; name: string; slug: string }, SaleorProductClientErrorType>> {
    const result = await this.client.mutation(CREATE_CATEGORY_MUTATION, { input });

    if (result.error) {
      return err(new SaleorProductClientError("Failed to create category", { cause: result.error }));
    }

    const { categoryCreate } = result.data;

    if (categoryCreate.errors?.length > 0) {
      return err(
        new SaleorProductClientError("Category creation failed", {
          props: { errors: categoryCreate.errors },
        })
      );
    }

    return ok(categoryCreate.category);
  }

  async createCollection(input: {
    name: string;
    slug?: string;
    description?: string;
  }): Promise<Result<{ id: string; name: string; slug: string }, SaleorProductClientErrorType>> {
    const result = await this.client.mutation(CREATE_COLLECTION_MUTATION, { input });

    if (result.error) {
      return err(new SaleorProductClientError("Failed to create collection", { cause: result.error }));
    }

    const { collectionCreate } = result.data;

    if (collectionCreate.errors?.length > 0) {
      return err(
        new SaleorProductClientError("Collection creation failed", {
          props: { errors: collectionCreate.errors },
        })
      );
    }

    return ok(collectionCreate.collection);
  }

  async addProductsToCollection(
    collectionId: string,
    productIds: string[]
  ): Promise<Result<void, SaleorProductClientErrorType>> {
    const result = await this.client.mutation(ADD_PRODUCTS_TO_COLLECTION_MUTATION, {
      collectionId,
      products: productIds,
    });

    if (result.error) {
      return err(new SaleorProductClientError("Failed to add products to collection", { cause: result.error }));
    }

    const { collectionAddProducts } = result.data;

    if (collectionAddProducts.errors?.length > 0) {
      return err(
        new SaleorProductClientError("Adding products to collection failed", {
          props: { errors: collectionAddProducts.errors },
        })
      );
    }

    return ok(undefined);
  }

  async createProduct(
    input: SaleorProductCreateInput
  ): Promise<Result<{ id: string; name: string; slug: string }, SaleorProductClientErrorType>> {
    const result = await this.client.mutation(CREATE_PRODUCT_MUTATION, { input });

    if (result.error) {
      return err(new SaleorProductClientError("Failed to create product", { cause: result.error }));
    }

    const { productCreate } = result.data;

    if (productCreate.errors?.length > 0) {
      return err(
        new SaleorProductClientError("Product creation failed", {
          props: { errors: productCreate.errors },
        })
      );
    }

    return ok(productCreate.product);
  }

  async updateProduct(
    id: string,
    input: Partial<Omit<SaleorProductCreateInput, "productType">>
  ): Promise<Result<{ id: string; name: string; slug: string }, SaleorProductClientErrorType>> {
    const result = await this.client.mutation(UPDATE_PRODUCT_MUTATION, { id, input });

    if (result.error) {
      return err(new SaleorProductClientError("Failed to update product", { cause: result.error }));
    }

    const { productUpdate } = result.data;

    if (productUpdate.errors?.length > 0) {
      return err(
        new SaleorProductClientError("Product update failed", {
          props: { errors: productUpdate.errors },
        })
      );
    }

    return ok(productUpdate.product);
  }

  async createProductVariant(
    input: SaleorProductVariantCreateInput
  ): Promise<Result<{ id: string; name: string; sku: string | null }, SaleorProductClientErrorType>> {
    const result = await this.client.mutation(CREATE_PRODUCT_VARIANT_MUTATION, { input });

    if (result.error) {
      return err(new SaleorProductClientError("Failed to create product variant", { cause: result.error }));
    }

    const { productVariantCreate } = result.data;

    if (productVariantCreate.errors?.length > 0) {
      return err(
        new SaleorProductClientError("Product variant creation failed", {
          props: { errors: productVariantCreate.errors },
        })
      );
    }

    return ok(productVariantCreate.productVariant);
  }

  async updateProductVariant(
    id: string,
    input: Omit<SaleorProductVariantCreateInput, "product">
  ): Promise<Result<{ id: string; name: string; sku: string | null }, SaleorProductClientErrorType>> {
    const result = await this.client.mutation(UPDATE_PRODUCT_VARIANT_MUTATION, { id, input });

    if (result.error) {
      return err(new SaleorProductClientError("Failed to update product variant", { cause: result.error }));
    }

    const { productVariantUpdate } = result.data;

    if (productVariantUpdate.errors?.length > 0) {
      return err(
        new SaleorProductClientError("Product variant update failed", {
          props: { errors: productVariantUpdate.errors },
        })
      );
    }

    return ok(productVariantUpdate.productVariant);
  }

  async updateProductVariantStocks(
    variantId: string,
    stocks: Array<{ warehouse: string; quantity: number }>
  ): Promise<Result<void, SaleorProductClientErrorType>> {
    const result = await this.client.mutation(UPDATE_PRODUCT_VARIANT_STOCKS_MUTATION, {
      variantId,
      stocks,
    });

    if (result.error) {
      return err(new SaleorProductClientError("Failed to update stocks", { cause: result.error }));
    }

    const { productVariantStocksUpdate } = result.data;

    if (productVariantStocksUpdate.errors?.length > 0) {
      return err(
        new SaleorProductClientError("Stocks update failed", {
          props: { errors: productVariantStocksUpdate.errors },
        })
      );
    }

    return ok(undefined);
  }

  async updateProductChannelListing(
    productId: string,
    input: {
      updateChannels?: Array<{
        channelId: string;
        isPublished?: boolean;
        isAvailableForPurchase?: boolean;
        visibleInListings?: boolean;
      }>;
    }
  ): Promise<Result<void, SaleorProductClientErrorType>> {
    const result = await this.client.mutation(PRODUCT_CHANNEL_LISTING_UPDATE_MUTATION, {
      id: productId,
      input,
    });

    if (result.error) {
      return err(new SaleorProductClientError("Failed to update channel listing", { cause: result.error }));
    }

    const { productChannelListingUpdate } = result.data;

    if (productChannelListingUpdate.errors?.length > 0) {
      return err(
        new SaleorProductClientError("Channel listing update failed", {
          props: { errors: productChannelListingUpdate.errors },
        })
      );
    }

    return ok(undefined);
  }

  async updateProductVariantChannelListing(
    variantId: string,
    input: Array<{
      channelId: string;
      price: number;
      costPrice?: number;
    }>
  ): Promise<Result<void, SaleorProductClientErrorType>> {
    const result = await this.client.mutation(PRODUCT_VARIANT_CHANNEL_LISTING_UPDATE_MUTATION, {
      id: variantId,
      input,
    });

    if (result.error) {
      return err(new SaleorProductClientError("Failed to update variant channel listing", { cause: result.error }));
    }

    const { productVariantChannelListingUpdate } = result.data;

    if (productVariantChannelListingUpdate.errors?.length > 0) {
      return err(
        new SaleorProductClientError("Variant channel listing update failed", {
          props: { errors: productVariantChannelListingUpdate.errors },
        })
      );
    }

    return ok(undefined);
  }

  async createProductMedia(input: {
    product: string;
    mediaUrl: string;
    alt?: string;
  }): Promise<Result<{ id: string; url: string }, SaleorProductClientErrorType>> {
    const result = await this.client.mutation(PRODUCT_MEDIA_CREATE_MUTATION, { input });

    if (result.error) {
      return err(new SaleorProductClientError("Failed to create product media", { cause: result.error }));
    }

    const { productMediaCreate } = result.data;

    if (productMediaCreate.errors?.length > 0) {
      return err(
        new SaleorProductClientError("Product media creation failed", {
          props: { errors: productMediaCreate.errors },
        })
      );
    }

    return ok(productMediaCreate.media);
  }

  async updateMetadata(
    id: string,
    metadata: Array<{ key: string; value: string }>
  ): Promise<Result<void, SaleorProductClientErrorType>> {
    const result = await this.client.mutation(UPDATE_METADATA_MUTATION, {
      id,
      input: metadata,
    });

    if (result.error) {
      return err(new SaleorProductClientError("Failed to update metadata", { cause: result.error }));
    }

    const { updateMetadata } = result.data;

    if (updateMetadata.errors?.length > 0) {
      return err(
        new SaleorProductClientError("Metadata update failed", {
          props: { errors: updateMetadata.errors },
        })
      );
    }

    return ok(undefined);
  }
}
