import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { SaleorProductClient } from "@/modules/saleor/saleor-product-client";
import { ShopifyClient } from "@/modules/shopify/shopify-client";
import { ShopifyProduct } from "@/modules/shopify/types";

import {
  toShopifyProductInput,
  toShopifyVariantInput,
  TransformedShopifyProduct,
  transformSaleorProductsToShopify,
} from "./saleor-to-shopify-transformer";

const logger = createLogger("ExportToShopifyUseCase");

export const ExportError = BaseError.subclass("ExportError", {
  props: { _brand: "ExportError" as const },
});

export type ExportErrorType = InstanceType<typeof ExportError>;

export interface ExportResult {
  exported: number;
  updated: number;
  failed: number;
  errors: Array<{ productName: string; error: string }>;
}

interface ExportContext {
  existingProducts: Map<string, ShopifyProduct>;
}

export class ExportToShopifyUseCase {
  private saleorClient: SaleorProductClient;
  private shopifyClient: ShopifyClient;

  constructor(saleorClient: SaleorProductClient, shopifyClient: ShopifyClient) {
    this.saleorClient = saleorClient;
    this.shopifyClient = shopifyClient;
  }

  async execute(args: {
    channelSlug: string;
  }): Promise<Result<ExportResult, ExportErrorType>> {
    logger.info("Starting export to Shopify", { channelSlug: args.channelSlug });

    const result: ExportResult = {
      exported: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    const contextResult = await this.initializeExportContext();

    if (contextResult.isErr()) {
      return err(contextResult.error);
    }
    const context = contextResult.value;

    const productsResult = await this.saleorClient.getAllProducts(args.channelSlug);

    if (productsResult.isErr()) {
      return err(new ExportError("Failed to fetch Saleor products", { cause: productsResult.error }));
    }

    const transformedProducts = transformSaleorProductsToShopify(productsResult.value);

    logger.info(`Found ${transformedProducts.length} products to export`);

    for (const product of transformedProducts) {
      const exportResult = await this.exportProduct(product, context);

      if (exportResult.isErr()) {
        result.failed++;
        result.errors.push({
          productName: product.title,
          error: exportResult.error.message,
        });
        logger.error("Failed to export product", {
          productName: product.title,
          error: exportResult.error,
        });
      } else if (exportResult.value.updated) {
        result.updated++;
      } else {
        result.exported++;
      }
    }

    logger.info("Export completed", result);

    return ok(result);
  }

  private async initializeExportContext(): Promise<Result<ExportContext, ExportErrorType>> {
    const productsResult = await this.shopifyClient.getAllProducts();

    if (productsResult.isErr()) {
      return err(new ExportError("Failed to fetch Shopify products", { cause: productsResult.error }));
    }

    const existingProducts = new Map<string, ShopifyProduct>();

    for (const product of productsResult.value) {
      const saleorIdMeta = product.metafields?.edges?.find(
        (e) => e.node.namespace === "saleor" && e.node.key === "product_id"
      );

      if (saleorIdMeta) {
        existingProducts.set(saleorIdMeta.node.value, product);
      }
    }

    return ok({ existingProducts });
  }

  private async exportProduct(
    product: TransformedShopifyProduct,
    context: ExportContext
  ): Promise<Result<{ updated: boolean }, ExportErrorType>> {
    logger.debug("Exporting product", { title: product.title, saleorId: product.saleorId });

    const existingProduct = context.existingProducts.get(product.saleorId);

    if (existingProduct) {
      return this.updateExistingProduct(existingProduct, product);
    }

    return this.createNewProduct(product);
  }

  private async createNewProduct(
    product: TransformedShopifyProduct
  ): Promise<Result<{ updated: boolean }, ExportErrorType>> {
    const input = toShopifyProductInput(product);

    const createResult = await this.shopifyClient.createProduct(input);

    if (createResult.isErr()) {
      return err(new ExportError("Failed to create product in Shopify", { cause: createResult.error }));
    }

    const productId = createResult.value.id;

    for (let i = 0; i < product.variants.length; i++) {
      const variant = product.variants[i];
      const variantInput = toShopifyVariantInput(variant);

      if (i === 0) {
        continue;
      }

      const variantResult = await this.shopifyClient.createProductVariant(productId, variantInput);

      if (variantResult.isErr()) {
        logger.warn("Failed to create variant", {
          productId,
          variantSku: variant.sku,
          error: variantResult.error,
        });
      }
    }

    return ok({ updated: false });
  }

  private async updateExistingProduct(
    existingProduct: ShopifyProduct,
    product: TransformedShopifyProduct
  ): Promise<Result<{ updated: boolean }, ExportErrorType>> {
    logger.debug("Updating existing Shopify product", {
      shopifyId: existingProduct.id,
      title: product.title,
    });

    for (const variant of product.variants) {
      const existingVariant = existingProduct.variants?.edges?.find((e) => {
        const saleorMeta = e.node.metafields?.edges?.find(
          (m) => m.node.namespace === "saleor" && m.node.key === "variant_id"
        );

        return saleorMeta?.node.value === variant.saleorId;
      });

      if (existingVariant) {
        const updateResult = await this.shopifyClient.updateProductVariant(
          existingVariant.node.id,
          {
            price: variant.price,
            sku: variant.sku ?? undefined,
            weight: variant.weight ?? undefined,
          }
        );

        if (updateResult.isErr()) {
          logger.warn("Failed to update variant", {
            variantId: existingVariant.node.id,
            error: updateResult.error,
          });
        }
      }
    }

    return ok({ updated: true });
  }
}
