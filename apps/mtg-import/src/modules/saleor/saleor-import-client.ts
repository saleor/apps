/**
 * Saleor GraphQL client wrapper for MTG import operations.
 *
 * Resolves channels, product types, categories, and warehouses by slug.
 * Executes productBulkCreate with batching.
 */

import type { Client } from "urql";

import { SaleorApiError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";

import type { AttributeDef } from "../import/attribute-map";
import {
  ATTRIBUTE_BULK_CREATE_MUTATION,
  ATTRIBUTES_BY_SLUGS_QUERY,
  type AttributeBulkCreateResult,
  CATEGORIES_QUERY,
  CHANNELS_QUERY,
  PRODUCT_ATTRIBUTE_ASSIGN_MUTATION,
  PRODUCT_BULK_CREATE_MUTATION,
  PRODUCT_UPDATE_MUTATION,
  PRODUCT_BY_SLUG_QUERY,
  PRODUCT_MEDIA_CREATE_MUTATION,
  PRODUCT_METADATA_QUERY,
  PRODUCT_TYPES_QUERY,
  PRODUCT_VARIANT_BULK_UPDATE_MUTATION,
  PRODUCTS_BY_METADATA_QUERY,
  PRODUCTS_WITH_VARIANTS_QUERY,
  type ProductAttributeAssignResult,
  type ProductBulkCreateResult,
  type ProductUpdateResult,
  type ProductMediaCreateResult,
  type SaleorCategory,
  type SaleorChannel,
  type SaleorProductType,
  type SaleorProductWithAttributes,
  type SaleorProductWithVariants,
  type SaleorWarehouse,
  type VariantBulkUpdateResult,
  WAREHOUSES_QUERY,
} from "./graphql-operations";

const logger = createLogger("SaleorImportClient");

export interface ImportContext {
  channels: SaleorChannel[];
  productType: SaleorProductType;
  category: SaleorCategory;
  /** Primary warehouse (first from list, used for stock entries) */
  warehouse: SaleorWarehouse;
  /** All selected warehouses */
  warehouses: SaleorWarehouse[];
}

export class SaleorImportClient {
  private readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  /** Resolve all channels */
  async getChannels(): Promise<SaleorChannel[]> {
    const result = await this.client.query(CHANNELS_QUERY, {}).toPromise();
    if (result.error) {
      throw new SaleorApiError(`Failed to fetch channels: ${result.error.message}`);
    }
    return result.data?.channels ?? [];
  }

  /** Find channels by slug list (e.g., ["webstore", "singles-builder"]) */
  async getChannelsBySlugs(slugs: string[]): Promise<SaleorChannel[]> {
    const all = await this.getChannels();
    const found = all.filter((ch) => slugs.includes(ch.slug));
    const missing = slugs.filter((s) => !found.some((ch) => ch.slug === s));
    if (missing.length > 0) {
      logger.warn("Some channels not found", { missing, available: all.map((ch) => ch.slug) });
    }
    return found;
  }

  /** Find or create the MTG Card product type */
  async getProductType(slug: string = "mtg-card"): Promise<SaleorProductType> {
    const result = await this.client
      .query(PRODUCT_TYPES_QUERY, { filter: { search: slug } })
      .toPromise();

    if (result.error) {
      throw new SaleorApiError(`Failed to fetch product types: ${result.error.message}`);
    }

    const types = result.data?.productTypes?.edges ?? [];
    const match = types.find(
      (e: { node: SaleorProductType }) => e.node.slug === slug
    );

    if (!match) {
      throw new SaleorApiError(
        `Product type "${slug}" not found. Create it in Saleor Dashboard first.`
      );
    }

    return match.node;
  }

  /** Find the MTG Cards category */
  async getCategory(slug: string = "mtg-singles"): Promise<SaleorCategory> {
    const result = await this.client
      .query(CATEGORIES_QUERY, { filter: { search: slug } })
      .toPromise();

    if (result.error) {
      throw new SaleorApiError(`Failed to fetch categories: ${result.error.message}`);
    }

    const categories = result.data?.categories?.edges ?? [];
    const match = categories.find(
      (e: { node: SaleorCategory }) => e.node.slug === slug
    );

    if (!match) {
      throw new SaleorApiError(
        `Category "${slug}" not found. Create it in Saleor Dashboard first.`
      );
    }

    return match.node;
  }

  /** Get all warehouses */
  async getWarehouses(): Promise<SaleorWarehouse[]> {
    const result = await this.client.query(WAREHOUSES_QUERY, {}).toPromise();

    if (result.error) {
      throw new SaleorApiError(`Failed to fetch warehouses: ${result.error.message}`);
    }

    const warehouses = result.data?.warehouses?.edges ?? [];
    return warehouses.map((e: { node: SaleorWarehouse }) => e.node);
  }

  /** Get the first warehouse (for stock entries) */
  async getWarehouse(): Promise<SaleorWarehouse> {
    const all = await this.getWarehouses();
    if (all.length === 0) {
      throw new SaleorApiError("No warehouses found. Create one in Saleor Dashboard first.");
    }
    return all[0];
  }

  /** Get warehouses by slug list. Empty array = first warehouse (legacy behavior). */
  async getWarehousesBySlugs(slugs: string[]): Promise<SaleorWarehouse[]> {
    const all = await this.getWarehouses();
    if (slugs.length === 0) {
      if (all.length === 0) {
        throw new SaleorApiError("No warehouses found. Create one in Saleor Dashboard first.");
      }
      return [all[0]];
    }
    const found = all.filter((wh) => slugs.includes(wh.slug));
    const missing = slugs.filter((s) => !found.some((wh) => wh.slug === s));
    if (missing.length > 0) {
      logger.warn("Some warehouses not found", { missing, available: all.map((wh) => wh.slug) });
    }
    if (found.length === 0) {
      throw new SaleorApiError(`None of the configured warehouses found: ${slugs.join(", ")}`);
    }
    return found;
  }

  /** Resolve the full import context (channels, product type, category, warehouses) */
  async resolveImportContext(
    channelSlugs: string[] = ["webstore", "singles-builder"],
    productTypeSlug: string = "mtg-card",
    categorySlug: string = "mtg-singles",
    warehouseSlugs: string[] = [],
  ): Promise<ImportContext> {
    const [channels, productType, category, warehouses] = await Promise.all([
      this.getChannelsBySlugs(channelSlugs),
      this.getProductType(productTypeSlug),
      this.getCategory(categorySlug),
      this.getWarehousesBySlugs(warehouseSlugs),
    ]);

    logger.info("Import context resolved", {
      channels: channels.map((ch) => ch.slug),
      productType: productType.slug,
      category: category.slug,
      warehouses: warehouses.map((wh) => wh.slug),
    });

    return { channels, productType, category, warehouse: warehouses[0], warehouses };
  }

  /** Check if a product already exists by slug */
  async productExists(slug: string, channelSlug: string = "webstore"): Promise<boolean> {
    const result = await this.client
      .query(PRODUCT_BY_SLUG_QUERY, { slug, channel: channelSlug })
      .toPromise();
    return !!result.data?.product;
  }

  /** Execute productBulkCreate mutation */
  async bulkCreateProducts(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    products: any[]
  ): Promise<ProductBulkCreateResult> {
    const result = await this.client
      .mutation(PRODUCT_BULK_CREATE_MUTATION, { products })
      .toPromise();

    if (result.error) {
      throw new SaleorApiError(`productBulkCreate failed: ${result.error.message}`);
    }

    const data = result.data?.productBulkCreate as ProductBulkCreateResult | undefined;
    if (!data) {
      throw new SaleorApiError("productBulkCreate returned no data");
    }

    // Log row-level errors (skip slug duplicates — handled by job processor as expected skips)
    for (const row of data.results) {
      if (row.errors.length > 0) {
        const isSlugDuplicate = row.errors.every(
          (e) => e.code === "UNIQUE" && (e.path === "slug" || e.message?.includes("Slug already exists"))
        );
        if (!isSlugDuplicate) {
          logger.warn("Product creation error", {
            product: row.product?.name ?? "unknown",
            errors: row.errors,
          });
        }
      }
    }

    return data;
  }

  /** Execute productUpdate mutation for a single product */
  async updateProduct(
    id: string,
    input: Record<string, unknown>
  ): Promise<ProductUpdateResult> {
    const result = await this.client
      .mutation(PRODUCT_UPDATE_MUTATION, { id, input })
      .toPromise();

    if (result.error) {
      throw new SaleorApiError(`productUpdate failed for ${id}: ${result.error.message}`);
    }

    const data = result.data?.productUpdate as ProductUpdateResult | undefined;
    if (!data) {
      throw new SaleorApiError(`productUpdate returned no data for ${id}`);
    }

    if (data.errors.length > 0) {
      logger.warn("Product update error", {
        productId: id,
        product: data.product?.name ?? "unknown",
        errors: data.errors,
      });
    }

    return data;
  }

  /** Update multiple products concurrently with throttling */
  async updateProductsBatch(
    products: Array<{ id: string; input: Record<string, unknown> }>,
    concurrency: number = 10
  ): Promise<{ updated: number; failed: number; errors: string[] }> {
    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < products.length; i += concurrency) {
      const chunk = products.slice(i, i + concurrency);
      const results = await Promise.allSettled(
        chunk.map((p) => this.updateProduct(p.id, p.input))
      );

      for (const result of results) {
        if (result.status === "fulfilled" && result.value.errors.length === 0) {
          updated++;
        } else if (result.status === "rejected") {
          failed++;
          errors.push(result.reason instanceof Error ? result.reason.message : String(result.reason));
        } else if (result.status === "fulfilled" && result.value.errors.length > 0) {
          failed++;
          errors.push(result.value.errors.map((e) => e.message).join("; "));
        }
      }
    }

    return { updated, failed, errors };
  }

  /** Fetch products by set_code metadata with full attributes */
  async getProductsBySetCode(
    setCode: string,
    channel: string = "webstore"
  ): Promise<SaleorProductWithAttributes[]> {
    const result = await this.client
      .query(PRODUCTS_BY_METADATA_QUERY, {
        filter: { metadata: [{ key: "set_code", value: setCode }] },
        channel,
        first: 100,
      })
      .toPromise();

    if (result.error) {
      throw new SaleorApiError(`Failed to fetch products by metadata: ${result.error.message}`);
    }

    const edges = result.data?.products?.edges ?? [];
    return edges.map((e: { node: SaleorProductWithAttributes }) => e.node);
  }

  /** Create missing attributes and assign them to the product type */
  async createMissingAttributes(
    missingDefs: AttributeDef[],
    productTypeId: string
  ): Promise<{ created: number; assigned: number; errors: string[] }> {
    const errors: string[] = [];
    const missingSlugs = missingDefs.map((d) => d.slug);

    // Step 1: Check which attributes already exist globally in Saleor
    const existingResult = await this.client
      .query(ATTRIBUTES_BY_SLUGS_QUERY, { slugs: missingSlugs })
      .toPromise();

    const existingAttrs: Array<{ id: string; slug: string }> =
      (existingResult.data?.attributes?.edges ?? []).map(
        (e: { node: { id: string; slug: string } }) => e.node
      );

    const existingSlugSet = new Set(existingAttrs.map((a) => a.slug));
    const existingIds = existingAttrs.map((a) => a.id);
    const trulyMissingDefs = missingDefs.filter((d) => !existingSlugSet.has(d.slug));

    logger.info("Attribute lookup", {
      requested: missingSlugs.length,
      alreadyExist: existingAttrs.length,
      needCreation: trulyMissingDefs.length,
    });

    // Step 2: Bulk-create only the truly missing attributes
    let newlyCreatedIds: string[] = [];
    if (trulyMissingDefs.length > 0) {
      const createInputs = trulyMissingDefs.map((def) => ({
        name: def.name,
        slug: def.slug,
        type: "PRODUCT_TYPE" as const,
        inputType: def.inputType,
      }));

      const createResult = await this.client
        .mutation(ATTRIBUTE_BULK_CREATE_MUTATION, { attributes: createInputs })
        .toPromise();

      if (createResult.error) {
        throw new SaleorApiError(`attributeBulkCreate failed: ${createResult.error.message}`);
      }

      const createData = createResult.data?.attributeBulkCreate as AttributeBulkCreateResult | undefined;
      if (!createData) {
        throw new SaleorApiError("attributeBulkCreate returned no data");
      }

      for (const row of createData.results) {
        if (row.attribute) {
          newlyCreatedIds.push(row.attribute.id);
        }
        if (row.errors && row.errors.length > 0) {
          for (const err of row.errors) {
            errors.push(`Create ${err.path ?? "attribute"}: ${err.message ?? err.code}`);
          }
        }
      }

      for (const err of createData.errors) {
        errors.push(`Bulk create: ${err.message ?? err.code}`);
      }

      logger.info("Attributes created", { count: newlyCreatedIds.length, errors: errors.length });
    }

    // Step 3: Assign ALL attributes (existing + newly created) to the product type
    const allIdsToAssign = [...existingIds, ...newlyCreatedIds];

    if (allIdsToAssign.length === 0) {
      return { created: newlyCreatedIds.length, assigned: 0, errors };
    }

    const assignOps = allIdsToAssign.map((id) => ({
      id,
      type: "PRODUCT" as const,
    }));

    const assignResult = await this.client
      .mutation(PRODUCT_ATTRIBUTE_ASSIGN_MUTATION, {
        productTypeId,
        operations: assignOps,
      })
      .toPromise();

    if (assignResult.error) {
      throw new SaleorApiError(`productAttributeAssign failed: ${assignResult.error.message}`);
    }

    const assignData = assignResult.data?.productAttributeAssign as ProductAttributeAssignResult | undefined;
    if (!assignData) {
      throw new SaleorApiError("productAttributeAssign returned no data");
    }

    for (const err of assignData.errors) {
      errors.push(`Assign: ${err.message ?? err.code}`);
    }

    const assignedCount = assignData.errors.length === 0 ? allIdsToAssign.length : 0;

    logger.info("Attributes assigned to product type", {
      productTypeId,
      assigned: assignedCount,
      existing: existingIds.length,
      newlyCreated: newlyCreatedIds.length,
    });

    return { created: newlyCreatedIds.length, assigned: assignedCount, errors };
  }

  /** Fetch all products for a set with their variant details (paginated) */
  async getProductsWithVariants(
    setCode: string,
    channel: string = "webstore"
  ): Promise<SaleorProductWithVariants[]> {
    const allProducts: SaleorProductWithVariants[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: { data?: any; error?: { message: string } } = await this.client
        .query(PRODUCTS_WITH_VARIANTS_QUERY, {
          filter: { metadata: [{ key: "set_code", value: setCode }] },
          channel,
          first: 100,
          after: cursor,
        })
        .toPromise();

      if (result.error) {
        throw new SaleorApiError(`Failed to fetch products with variants: ${result.error.message}`);
      }

      const edges = result.data?.products?.edges ?? [];
      for (const edge of edges) {
        allProducts.push(edge.node as SaleorProductWithVariants);
      }

      const pageInfo: { hasNextPage?: boolean; endCursor?: string | null } | undefined =
        result.data?.products?.pageInfo;
      hasNextPage = pageInfo?.hasNextPage ?? false;
      cursor = pageInfo?.endCursor ?? null;
    }

    return allProducts;
  }

  /** Bulk update variant attributes for a single product */
  async bulkUpdateVariants(
    productId: string,
    variants: Array<{ id: string; attributes: Array<Record<string, unknown>> }>
  ): Promise<VariantBulkUpdateResult> {
    const result = await this.client
      .mutation(PRODUCT_VARIANT_BULK_UPDATE_MUTATION, { productId, variants })
      .toPromise();

    if (result.error) {
      throw new SaleorApiError(`productVariantBulkUpdate failed: ${result.error.message}`);
    }

    const data = result.data?.productVariantBulkUpdate as VariantBulkUpdateResult | undefined;
    if (!data) {
      throw new SaleorApiError("productVariantBulkUpdate returned no data");
    }

    for (const row of data.results) {
      if (row.errors.length > 0) {
        logger.warn("Variant update error", { productId, errors: row.errors });
      }
    }

    return data;
  }

  /** Fetch a product's metadata by ID */
  async getProductMetadata(
    productId: string
  ): Promise<Array<{ key: string; value: string }> | null> {
    const result = await this.client
      .query(PRODUCT_METADATA_QUERY, { id: productId })
      .toPromise();

    if (result.error || !result.data?.product) {
      return null;
    }

    return result.data.product.metadata;
  }

  /** Attach a media URL to a product via productMediaCreate. Returns media object or null on error. */
  async createProductMedia(
    productId: string,
    mediaUrl: string,
    alt: string
  ): Promise<{ id: string; url: string } | null> {
    try {
      const result = await this.client
        .mutation(PRODUCT_MEDIA_CREATE_MUTATION, {
          input: { product: productId, mediaUrl, alt },
        })
        .toPromise();

      if (result.error) {
        logger.warn("productMediaCreate network error", {
          productId,
          error: result.error.message,
        });
        return null;
      }

      const data = result.data?.productMediaCreate as ProductMediaCreateResult | undefined;
      if (!data) {
        logger.warn("productMediaCreate returned no data", { productId });
        return null;
      }

      if (data.errors.length > 0) {
        logger.warn("productMediaCreate errors", {
          productId,
          errors: data.errors,
        });
        return null;
      }

      return data.media;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn("productMediaCreate failed", { productId, error: msg });
      return null;
    }
  }
}
