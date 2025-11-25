import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { ShopifyConnectionConfig } from "@/modules/app-config/domain/shopify-connection-config";

import {
  ShopifyCollectionsResponse,
  ShopifyProduct,
  ShopifyProductCreateInput,
  ShopifyProductsResponse,
  ShopifyProductVariantInput,
} from "./types";

const logger = createLogger("ShopifyClient");

export const ShopifyClientError = BaseError.subclass("ShopifyClientError", {
  props: { _brand: "ShopifyClientError" as const },
});

export type ShopifyClientErrorType = InstanceType<typeof ShopifyClientError>;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; locations?: Array<{ line: number; column: number }> }>;
}

interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatusCode(status: number): boolean {
  return status === 429 || status === 503 || status === 502 || status === 504;
}

const PRODUCTS_QUERY = `
  query getProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          title
          handle
          descriptionHtml
          vendor
          productType
          status
          tags
          options {
            id
            name
            position
            values
          }
          images(first: 50) {
            edges {
              node {
                id
                url
                altText
                width
                height
              }
            }
          }
          variants(first: 100) {
            edges {
              node {
                id
                title
                sku
                barcode
                price
                compareAtPrice
                weight
                weightUnit
                inventoryQuantity
                inventoryItem {
                  id
                  sku
                  tracked
                }
                selectedOptions {
                  name
                  value
                }
                image {
                  id
                  url
                  altText
                }
                metafields(first: 50) {
                  edges {
                    node {
                      id
                      namespace
                      key
                      value
                      type
                    }
                  }
                }
              }
            }
          }
          metafields(first: 50) {
            edges {
              node {
                id
                namespace
                key
                value
                type
              }
            }
          }
          collections(first: 50) {
            edges {
              node {
                id
                title
                handle
                description
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

const COLLECTIONS_QUERY = `
  query getCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          title
          handle
          description
          image {
            id
            url
            altText
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const PRODUCT_CREATE_MUTATION = `
  mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
        handle
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PRODUCT_VARIANT_CREATE_MUTATION = `
  mutation productVariantCreate($input: ProductVariantInput!) {
    productVariantCreate(input: $input) {
      productVariant {
        id
        title
        sku
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PRODUCT_VARIANT_UPDATE_MUTATION = `
  mutation productVariantUpdate($input: ProductVariantInput!) {
    productVariantUpdate(input: $input) {
      productVariant {
        id
        title
        sku
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export class ShopifyClient {
  private endpoint: string;
  private accessToken: string;
  private retryConfig: RetryConfig;

  constructor(config: ShopifyConnectionConfig, retryConfig?: Partial<RetryConfig>) {
    this.endpoint = config.getShopifyGraphQLEndpoint();
    this.accessToken = config.accessToken;
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  private async executeWithRetry<T>(
    fn: () => Promise<Response>,
    attempt: number = 0
  ): Promise<Result<Response, ShopifyClientErrorType>> {
    try {
      const response = await fn();

      if (isRetryableStatusCode(response.status) && attempt < this.retryConfig.maxRetries) {
        const retryAfter = response.headers.get("Retry-After");
        let delayMs = Math.min(
          this.retryConfig.initialDelayMs * Math.pow(this.retryConfig.backoffMultiplier, attempt),
          this.retryConfig.maxDelayMs
        );

        if (retryAfter) {
          const retryAfterMs = parseInt(retryAfter, 10) * 1000;
          if (!isNaN(retryAfterMs)) {
            delayMs = Math.min(retryAfterMs, this.retryConfig.maxDelayMs);
          }
        }

        logger.warn("Shopify API rate limited, retrying", {
          status: response.status,
          attempt: attempt + 1,
          maxRetries: this.retryConfig.maxRetries,
          delayMs,
        });

        await sleep(delayMs);
        return this.executeWithRetry(fn, attempt + 1);
      }

      return ok(response);
    } catch (error) {
      if (attempt < this.retryConfig.maxRetries) {
        const delayMs = Math.min(
          this.retryConfig.initialDelayMs * Math.pow(this.retryConfig.backoffMultiplier, attempt),
          this.retryConfig.maxDelayMs
        );

        logger.warn("Shopify API request failed, retrying", {
          error,
          attempt: attempt + 1,
          maxRetries: this.retryConfig.maxRetries,
          delayMs,
        });

        await sleep(delayMs);
        return this.executeWithRetry(fn, attempt + 1);
      }

      return err(
        new ShopifyClientError("Shopify API request failed after retries", {
          cause: error,
        })
      );
    }
  }

  private async executeQuery<T>(
    query: string,
    variables: Record<string, unknown> = {}
  ): Promise<Result<T, ShopifyClientErrorType>> {
    logger.debug("Executing Shopify GraphQL query", {
      endpoint: this.endpoint,
      variables,
    });

    const responseResult = await this.executeWithRetry(() =>
      fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": this.accessToken,
        },
        body: JSON.stringify({ query, variables }),
      })
    );

    if (responseResult.isErr()) {
      return err(responseResult.error);
    }

    const response = responseResult.value;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Shopify API request failed", {
        status: response.status,
        errorText,
      });
      return err(
        new ShopifyClientError(`Shopify API request failed: ${response.status}`, {
          props: { status: response.status, body: errorText },
        })
      );
    }

    const json = (await response.json()) as GraphQLResponse<T>;

    if (json.errors && json.errors.length > 0) {
      logger.error("Shopify GraphQL errors", { errors: json.errors });
      return err(
        new ShopifyClientError("Shopify GraphQL errors", {
          props: { errors: json.errors },
        })
      );
    }

    if (!json.data) {
      return err(new ShopifyClientError("Shopify API returned no data"));
    }

    return ok(json.data);
  }

  async getProducts(args: {
    first: number;
    after?: string;
  }): Promise<Result<ShopifyProductsResponse, ShopifyClientErrorType>> {
    return this.executeQuery<ShopifyProductsResponse>(PRODUCTS_QUERY, {
      first: args.first,
      after: args.after,
    });
  }

  async getAllProducts(): Promise<Result<ShopifyProduct[], ShopifyClientErrorType>> {
    const allProducts: ShopifyProduct[] = [];
    let hasNextPage = true;
    let cursor: string | undefined;

    while (hasNextPage) {
      const result = await this.getProducts({ first: 50, after: cursor });

      if (result.isErr()) {
        return err(result.error);
      }

      const { products } = result.value;

      if (products.edges.length > 0) {
        const firstProduct = products.edges[0].node;
        if (firstProduct.variants.edges.length >= 100) {
          logger.warn("Product has 100+ variants, some may be missing", {
            productId: firstProduct.id,
            productTitle: firstProduct.title,
            variantCount: firstProduct.variants.edges.length,
          });
        }
      }

      allProducts.push(...products.edges.map((edge) => edge.node));
      hasNextPage = products.pageInfo.hasNextPage;
      cursor = products.pageInfo.endCursor ?? undefined;
    }

    return ok(allProducts);
  }

  async getCollections(args: {
    first: number;
    after?: string;
  }): Promise<Result<ShopifyCollectionsResponse, ShopifyClientErrorType>> {
    return this.executeQuery<ShopifyCollectionsResponse>(COLLECTIONS_QUERY, {
      first: args.first,
      after: args.after,
    });
  }

  async createProduct(
    input: ShopifyProductCreateInput
  ): Promise<Result<{ id: string; title: string; handle: string }, ShopifyClientErrorType>> {
    const result = await this.executeQuery<{
      productCreate: {
        product: { id: string; title: string; handle: string } | null;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(PRODUCT_CREATE_MUTATION, { input });

    if (result.isErr()) {
      return err(result.error);
    }

    const { productCreate } = result.value;

    if (productCreate.userErrors.length > 0) {
      return err(
        new ShopifyClientError("Product creation failed", {
          props: { userErrors: productCreate.userErrors },
        })
      );
    }

    if (!productCreate.product) {
      return err(new ShopifyClientError("Product creation returned no product"));
    }

    logger.debug("Product created in Shopify", {
      productId: productCreate.product.id,
      productTitle: productCreate.product.title,
    });

    return ok(productCreate.product);
  }

  async createProductVariant(
    productId: string,
    input: ShopifyProductVariantInput
  ): Promise<Result<{ id: string; title: string; sku: string | null }, ShopifyClientErrorType>> {
    const result = await this.executeQuery<{
      productVariantCreate: {
        productVariant: { id: string; title: string; sku: string | null } | null;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(PRODUCT_VARIANT_CREATE_MUTATION, {
      input: { ...input, productId },
    });

    if (result.isErr()) {
      return err(result.error);
    }

    const { productVariantCreate } = result.value;

    if (productVariantCreate.userErrors.length > 0) {
      return err(
        new ShopifyClientError("Variant creation failed", {
          props: { userErrors: productVariantCreate.userErrors },
        })
      );
    }

    if (!productVariantCreate.productVariant) {
      return err(new ShopifyClientError("Variant creation returned no variant"));
    }

    logger.debug("Variant created in Shopify", {
      variantId: productVariantCreate.productVariant.id,
      variantTitle: productVariantCreate.productVariant.title,
    });

    return ok(productVariantCreate.productVariant);
  }

  async updateProductVariant(
    variantId: string,
    input: Omit<ShopifyProductVariantInput, "options">
  ): Promise<Result<{ id: string; title: string; sku: string | null }, ShopifyClientErrorType>> {
    const result = await this.executeQuery<{
      productVariantUpdate: {
        productVariant: { id: string; title: string; sku: string | null } | null;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(PRODUCT_VARIANT_UPDATE_MUTATION, {
      input: { ...input, id: variantId },
    });

    if (result.isErr()) {
      return err(result.error);
    }

    const { productVariantUpdate } = result.value;

    if (productVariantUpdate.userErrors.length > 0) {
      return err(
        new ShopifyClientError("Variant update failed", {
          props: { userErrors: productVariantUpdate.userErrors },
        })
      );
    }

    if (!productVariantUpdate.productVariant) {
      return err(new ShopifyClientError("Variant update returned no variant"));
    }

    logger.debug("Variant updated in Shopify", {
      variantId: productVariantUpdate.productVariant.id,
      variantTitle: productVariantUpdate.productVariant.title,
    });

    return ok(productVariantUpdate.productVariant);
  }
}
