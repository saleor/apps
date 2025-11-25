import { createLogger } from "@/lib/logger";
import { ShopifyProduct, ShopifyProductVariant } from "@/modules/shopify/types";

const logger = createLogger("ShopifyToSaleorTransformer");

export interface TransformedProduct {
  name: string;
  slug: string;
  description: string;
  productTypeName: string;
  categoryName: string | null;
  collectionNames: string[];
  options: Array<{ name: string; values: string[] }>;
  metadata: Array<{ key: string; value: string }>;
  variants: TransformedVariant[];
  images: Array<{ url: string; alt: string }>;
  shopifyId: string;
}

export interface TransformedVariant {
  name: string;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  weight: number | null;
  weightUnit: string | null;
  inventoryQuantity: number;
  options: Array<{ name: string; value: string }>;
  metadata: Array<{ key: string; value: string }>;
  imageUrl: string | null;
  shopifyId: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function extractShopifyId(gid: string): string {
  const parts = gid.split("/");
  return parts[parts.length - 1];
}

function transformVariant(
  variant: ShopifyProductVariant,
  productOptions: Array<{ name: string; values: string[] }>
): TransformedVariant {
  const metafields = variant.metafields?.edges?.map((edge) => ({
    key: `shopify_${edge.node.namespace}_${edge.node.key}`,
    value: edge.node.value,
  })) ?? [];

  metafields.push({
    key: "shopify_variant_id",
    value: extractShopifyId(variant.id),
  });

  const options = variant.selectedOptions.map((opt) => ({
    name: opt.name,
    value: opt.value,
  }));

  return {
    name: variant.title,
    sku: variant.sku,
    price: parseFloat(variant.price),
    compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : null,
    weight: variant.weight,
    weightUnit: variant.weightUnit,
    inventoryQuantity: variant.inventoryQuantity ?? 0,
    options,
    metadata: metafields,
    imageUrl: variant.image?.url ?? null,
    shopifyId: extractShopifyId(variant.id),
  };
}

export function transformShopifyProductToSaleor(product: ShopifyProduct): TransformedProduct {
  logger.debug("Transforming Shopify product", { productId: product.id, title: product.title });

  const metafields = product.metafields?.edges?.map((edge) => ({
    key: `shopify_${edge.node.namespace}_${edge.node.key}`,
    value: edge.node.value,
  })) ?? [];

  metafields.push({
    key: "shopify_product_id",
    value: extractShopifyId(product.id),
  });

  const options = product.options.map((opt) => ({
    name: opt.name,
    values: opt.values,
  }));

  const collectionNames = product.collections?.edges?.map((edge) => edge.node.title) ?? [];

  const images = product.images?.edges?.map((edge) => ({
    url: edge.node.url,
    alt: edge.node.altText ?? product.title,
  })) ?? [];

  const variants = product.variants?.edges?.map((edge) =>
    transformVariant(edge.node, options)
  ) ?? [];

  return {
    name: product.title,
    slug: slugify(product.handle || product.title),
    description: product.descriptionHtml,
    productTypeName: product.productType || "Default",
    categoryName: null,
    collectionNames,
    options,
    metadata: metafields,
    variants,
    images,
    shopifyId: extractShopifyId(product.id),
  };
}

export function transformShopifyProductsToSaleor(products: ShopifyProduct[]): TransformedProduct[] {
  return products.map(transformShopifyProductToSaleor);
}
