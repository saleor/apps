import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { SaleorProductClient } from "@/modules/saleor/saleor-product-client";
import { SaleorAttribute, SaleorProductType } from "@/modules/saleor/types";
import { ShopifyClient } from "@/modules/shopify/shopify-client";

import {
  transformShopifyProductsToSaleor,
  TransformedProduct,
  TransformedVariant,
} from "./shopify-to-saleor-transformer";

const logger = createLogger("ImportFromShopifyUseCase");

export const ImportError = BaseError.subclass("ImportError", {
  props: { _brand: "ImportError" as const },
});

export type ImportErrorType = InstanceType<typeof ImportError>;

export interface ImportResult {
  imported: number;
  updated: number;
  failed: number;
  errors: Array<{ productName: string; error: string }>;
}

interface SyncContext {
  channelId: string;
  channelSlug: string;
  warehouseId: string;
  productTypeCache: Map<string, SaleorProductType>;
  attributeCache: Map<string, SaleorAttribute>;
  collectionCache: Map<string, string>;
  existingProducts: Map<string, string>;
}

export class ImportFromShopifyUseCase {
  private shopifyClient: ShopifyClient;
  private saleorClient: SaleorProductClient;

  constructor(shopifyClient: ShopifyClient, saleorClient: SaleorProductClient) {
    this.shopifyClient = shopifyClient;
    this.saleorClient = saleorClient;
  }

  async execute(args: {
    channelSlug: string;
  }): Promise<Result<ImportResult, ImportErrorType>> {
    logger.info("Starting import from Shopify", { channelSlug: args.channelSlug });

    const result: ImportResult = {
      imported: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    const contextResult = await this.initializeSyncContext(args.channelSlug);
    if (contextResult.isErr()) {
      return err(contextResult.error);
    }
    const context = contextResult.value;

    const productsResult = await this.shopifyClient.getAllProducts();
    if (productsResult.isErr()) {
      return err(new ImportError("Failed to fetch Shopify products", { cause: productsResult.error }));
    }

    const transformedProducts = transformShopifyProductsToSaleor(productsResult.value);
    logger.info(`Found ${transformedProducts.length} products to import`);

    for (const product of transformedProducts) {
      const importResult = await this.importProduct(product, context);

      if (importResult.isErr()) {
        result.failed++;
        result.errors.push({
          productName: product.name,
          error: importResult.error.message,
        });
        logger.error("Failed to import product", {
          productName: product.name,
          error: importResult.error,
        });
      } else if (importResult.value.updated) {
        result.updated++;
      } else {
        result.imported++;
      }
    }

    logger.info("Import completed", result);
    return ok(result);
  }

  private async initializeSyncContext(
    channelSlug: string
  ): Promise<Result<SyncContext, ImportErrorType>> {
    const channelsResult = await this.saleorClient.getChannels();
    if (channelsResult.isErr()) {
      return err(new ImportError("Failed to fetch channels", { cause: channelsResult.error }));
    }

    const channel = channelsResult.value.find((c) => c.slug === channelSlug);
    if (!channel) {
      return err(new ImportError(`Channel not found: ${channelSlug}`));
    }

    const warehousesResult = await this.saleorClient.getWarehouses();
    if (warehousesResult.isErr()) {
      return err(new ImportError("Failed to fetch warehouses", { cause: warehousesResult.error }));
    }

    if (warehousesResult.value.length === 0) {
      return err(new ImportError("No warehouses found in Saleor"));
    }

    const productTypesResult = await this.saleorClient.getProductTypes();
    if (productTypesResult.isErr()) {
      return err(new ImportError("Failed to fetch product types", { cause: productTypesResult.error }));
    }

    const attributesResult = await this.saleorClient.getAttributes();
    if (attributesResult.isErr()) {
      return err(new ImportError("Failed to fetch attributes", { cause: attributesResult.error }));
    }

    const collectionsResult = await this.saleorClient.getCollections(channelSlug);
    if (collectionsResult.isErr()) {
      return err(new ImportError("Failed to fetch collections", { cause: collectionsResult.error }));
    }

    const productsResult = await this.saleorClient.getAllProducts(channelSlug);
    if (productsResult.isErr()) {
      return err(new ImportError("Failed to fetch existing products", { cause: productsResult.error }));
    }

    const existingProducts = new Map<string, string>();
    for (const product of productsResult.value) {
      const shopifyIdMeta = product.metadata.find((m) => m.key === "shopify_product_id");
      if (shopifyIdMeta) {
        existingProducts.set(shopifyIdMeta.value, product.id);
      }
    }

    return ok({
      channelId: channel.id,
      channelSlug: channel.slug,
      warehouseId: warehousesResult.value[0].id,
      productTypeCache: new Map(productTypesResult.value.map((pt) => [pt.name.toLowerCase(), pt])),
      attributeCache: new Map(attributesResult.value.map((a) => [a.slug, a])),
      collectionCache: new Map(collectionsResult.value.map((c) => [c.name.toLowerCase(), c.id])),
      existingProducts,
    });
  }

  private async importProduct(
    product: TransformedProduct,
    context: SyncContext
  ): Promise<Result<{ updated: boolean }, ImportErrorType>> {
    logger.debug("Importing product", { name: product.name, shopifyId: product.shopifyId });

    const existingProductId = context.existingProducts.get(product.shopifyId);

    const productTypeResult = await this.getOrCreateProductType(product, context);
    if (productTypeResult.isErr()) {
      return err(productTypeResult.error);
    }
    const productTypeId = productTypeResult.value;

    if (existingProductId) {
      return this.updateExistingProduct(existingProductId, product, productTypeId, context);
    }

    return this.createNewProduct(product, productTypeId, context);
  }

  private async getOrCreateProductType(
    product: TransformedProduct,
    context: SyncContext
  ): Promise<Result<string, ImportErrorType>> {
    const typeName = product.productTypeName || "Default";
    const existingType = context.productTypeCache.get(typeName.toLowerCase());

    if (existingType) {
      return ok(existingType.id);
    }

    const variantAttributeIds: string[] = [];

    for (const option of product.options) {
      const attrResult = await this.getOrCreateAttribute(option.name, "DROPDOWN", context);
      if (attrResult.isErr()) {
        return err(attrResult.error);
      }
      variantAttributeIds.push(attrResult.value);
    }

    const createResult = await this.saleorClient.createProductType({
      name: typeName,
      hasVariants: true,
      variantAttributes: variantAttributeIds,
    });

    if (createResult.isErr()) {
      return err(new ImportError("Failed to create product type", { cause: createResult.error }));
    }

    context.productTypeCache.set(typeName.toLowerCase(), {
      id: createResult.value.id,
      name: createResult.value.name,
      slug: createResult.value.slug,
    });

    return ok(createResult.value.id);
  }

  private async getOrCreateAttribute(
    name: string,
    inputType: string,
    context: SyncContext
  ): Promise<Result<string, ImportErrorType>> {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const existingAttr = context.attributeCache.get(slug);

    if (existingAttr) {
      return ok(existingAttr.id);
    }

    const createResult = await this.saleorClient.createAttribute({
      name,
      slug,
      type: "PRODUCT_TYPE",
      inputType,
    });

    if (createResult.isErr()) {
      return err(new ImportError("Failed to create attribute", { cause: createResult.error }));
    }

    context.attributeCache.set(slug, {
      id: createResult.value.id,
      name: createResult.value.name,
      slug: createResult.value.slug,
      inputType,
    });

    return ok(createResult.value.id);
  }

  private async createNewProduct(
    product: TransformedProduct,
    productTypeId: string,
    context: SyncContext
  ): Promise<Result<{ updated: boolean }, ImportErrorType>> {
    const createResult = await this.saleorClient.createProduct({
      name: product.name,
      slug: product.slug,
      description: JSON.stringify({ blocks: [{ type: "paragraph", data: { text: product.description } }] }),
      productType: productTypeId,
      metadata: product.metadata,
    });

    if (createResult.isErr()) {
      return err(new ImportError("Failed to create product", { cause: createResult.error }));
    }

    const productId = createResult.value.id;

    const channelResult = await this.saleorClient.updateProductChannelListing(productId, {
      updateChannels: [
        {
          channelId: context.channelId,
          isPublished: true,
          isAvailableForPurchase: true,
          visibleInListings: true,
        },
      ],
    });

    if (channelResult.isErr()) {
      logger.warn("Failed to update channel listing", { error: channelResult.error });
    }

    for (const image of product.images) {
      const mediaResult = await this.saleorClient.createProductMedia({
        product: productId,
        mediaUrl: image.url,
        alt: image.alt,
      });

      if (mediaResult.isErr()) {
        logger.warn("Failed to create product media", { error: mediaResult.error });
      }
    }

    for (const variant of product.variants) {
      const variantResult = await this.createVariant(productId, variant, context);

      if (variantResult.isErr()) {
        logger.warn("Failed to create variant, continuing with other variants", {
          productId,
          variantName: variant.name,
          variantSku: variant.sku,
          error: variantResult.error.message,
        });
      } else {
        logger.debug("Variant created successfully", {
          productId,
          variantId: variantResult.value,
          variantName: variant.name,
        });
      }
    }

    for (const collectionName of product.collectionNames) {
      const collectionId = context.collectionCache.get(collectionName.toLowerCase());

      if (collectionId) {
        const collectionResult = await this.saleorClient.addProductsToCollection(collectionId, [productId]);

        if (collectionResult.isErr()) {
          logger.warn("Failed to add product to collection, continuing", {
            productId,
            collectionName,
            collectionId,
            error: collectionResult.error.message,
          });
        } else {
          logger.debug("Product added to collection", {
            productId,
            collectionName,
            collectionId,
          });
        }
      }
    }

    return ok({ updated: false });
  }

  private async updateExistingProduct(
    productId: string,
    product: TransformedProduct,
    productTypeId: string,
    context: SyncContext
  ): Promise<Result<{ updated: boolean }, ImportErrorType>> {
    logger.debug("Updating existing product", { productId, name: product.name });

    const updateResult = await this.saleorClient.updateProduct(productId, {
      name: product.name,
      description: JSON.stringify({ blocks: [{ type: "paragraph", data: { text: product.description } }] }),
      metadata: product.metadata,
    });

    if (updateResult.isErr()) {
      return err(new ImportError("Failed to update product", { cause: updateResult.error }));
    }

    return ok({ updated: true });
  }

  private async createVariant(
    productId: string,
    variant: TransformedVariant,
    context: SyncContext
  ): Promise<Result<string, ImportErrorType>> {
    const attributes: Array<{ id: string; dropdown?: { value: string } }> = [];

    for (const option of variant.options) {
      const slug = option.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const attr = context.attributeCache.get(slug);

      if (attr) {
        await this.ensureAttributeValue(attr.id, option.value, context);
        attributes.push({
          id: attr.id,
          dropdown: { value: option.value },
        });
      }
    }

    const createResult = await this.saleorClient.createProductVariant({
      product: productId,
      name: variant.name,
      sku: variant.sku ?? undefined,
      trackInventory: true,
      weight: variant.weight ?? undefined,
      attributes,
      stocks: [
        {
          warehouse: context.warehouseId,
          quantity: variant.inventoryQuantity,
        },
      ],
      metadata: variant.metadata,
    });

    if (createResult.isErr()) {
      return err(new ImportError("Failed to create variant", { cause: createResult.error }));
    }

    const variantId = createResult.value.id;

    const priceResult = await this.saleorClient.updateProductVariantChannelListing(variantId, [
      {
        channelId: context.channelId,
        price: variant.price,
        costPrice: variant.compareAtPrice ?? undefined,
      },
    ]);

    if (priceResult.isErr()) {
      logger.warn("Failed to set variant price", { error: priceResult.error });
    }

    return ok(variantId);
  }

  private async ensureAttributeValue(
    attributeId: string,
    value: string,
    context: SyncContext
  ): Promise<void> {
    const attr = Array.from(context.attributeCache.values()).find((a) => a.id === attributeId);

    if (!attr) {
      logger.debug("Attribute not found in cache, skipping value creation", { attributeId });
      return;
    }

    const existingValue = attr.choices?.edges?.find(
      (e) => e.node.name.toLowerCase() === value.toLowerCase()
    );

    if (!existingValue) {
      const createResult = await this.saleorClient.createAttributeValue(attributeId, { name: value });

      if (createResult.isErr()) {
        logger.warn("Failed to create attribute value, variant may fail to create", {
          attributeId,
          attributeName: attr.name,
          value,
          error: createResult.error.message,
        });
      } else {
        logger.debug("Attribute value created", {
          attributeId,
          attributeName: attr.name,
          value,
          valueId: createResult.value.id,
        });
      }
    }
  }
}
