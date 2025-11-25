import { createLogger } from "@/lib/logger";
import { SaleorProduct, SaleorProductVariant } from "@/modules/saleor/types";
import { ShopifyProductCreateInput, ShopifyProductVariantInput } from "@/modules/shopify/types";

const logger = createLogger("SaleorToShopifyTransformer");

export interface TransformedShopifyProduct {
  title: string;
  handle: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  status: "ACTIVE" | "DRAFT";
  tags: string[];
  options: string[];
  metafields: Array<{
    namespace: string;
    key: string;
    value: string;
    type: string;
  }>;
  variants: TransformedShopifyVariant[];
  images: Array<{ src: string; altText: string }>;
  saleorId: string;
}

export interface TransformedShopifyVariant {
  price: string;
  compareAtPrice: string | null;
  sku: string | null;
  barcode: string | null;
  weight: number | null;
  weightUnit: string | null;
  options: string[];
  metafields: Array<{
    namespace: string;
    key: string;
    value: string;
    type: string;
  }>;
  inventoryQuantity: number;
  saleorId: string;
}

interface RichTextBlock {
  type?: string;
  data?: {
    text?: string;
  };
}

interface RichTextContent {
  blocks?: RichTextBlock[];
}

function isRichTextContent(value: unknown): value is RichTextContent {
  return (
    typeof value === "object" &&
    value !== null &&
    "blocks" in value &&
    Array.isArray((value as RichTextContent).blocks)
  );
}

function extractDescription(description: string): string {
  try {
    const parsed: unknown = JSON.parse(description);

    if (isRichTextContent(parsed) && parsed.blocks) {
      return parsed.blocks
        .map((block) => block.data?.text ?? "")
        .filter(Boolean)
        .join("<br/>");
    }

    return description;
  } catch {
    return description;
  }
}

function transformVariant(variant: SaleorProductVariant): TransformedShopifyVariant {
  const metafields = variant.metadata
    .filter((m) => !m.key.startsWith("shopify_"))
    .map((m) => ({
      namespace: "saleor",
      key: m.key,
      value: m.value,
      type: "single_line_text_field",
    }));

  metafields.push({
    namespace: "saleor",
    key: "variant_id",
    value: variant.id,
    type: "single_line_text_field",
  });

  const options = variant.attributes.map((attr) =>
    attr.values[0]?.name ?? attr.values[0]?.slug ?? ""
  );

  const price = variant.pricing?.price?.gross?.amount?.toString() ?? "0";
  const totalStock = variant.stocks.reduce((sum, stock) => sum + stock.quantity, 0);

  return {
    price,
    compareAtPrice: null,
    sku: variant.sku,
    barcode: null,
    weight: variant.weight?.value ?? null,
    weightUnit: variant.weight?.unit ?? null,
    options,
    metafields,
    inventoryQuantity: totalStock,
    saleorId: variant.id,
  };
}

export function transformSaleorProductToShopify(product: SaleorProduct): TransformedShopifyProduct {
  logger.debug("Transforming Saleor product", { productId: product.id, name: product.name });

  const metafields = product.metadata
    .filter((m) => !m.key.startsWith("shopify_"))
    .map((m) => ({
      namespace: "saleor",
      key: m.key,
      value: m.value,
      type: "single_line_text_field",
    }));

  metafields.push({
    namespace: "saleor",
    key: "product_id",
    value: product.id,
    type: "single_line_text_field",
  });

  const options = product.productType.variantAttributes?.map((attr) => attr.name) ?? [];

  const tags = product.collections.map((c) => c.name);

  const images = product.media
    .filter((m) => m.type === "IMAGE")
    .map((m) => ({
      src: m.url,
      altText: m.alt || product.name,
    }));

  const variants = product.variants.map(transformVariant);

  return {
    title: product.name,
    handle: product.slug,
    descriptionHtml: extractDescription(product.description),
    vendor: "",
    productType: product.productType.name,
    status: "ACTIVE",
    tags,
    options: options.length > 0 ? options : ["Title"],
    metafields,
    variants,
    images,
    saleorId: product.id,
  };
}

export function transformSaleorProductsToShopify(products: SaleorProduct[]): TransformedShopifyProduct[] {
  return products.map(transformSaleorProductToShopify);
}

export function toShopifyProductInput(product: TransformedShopifyProduct): ShopifyProductCreateInput {
  return {
    title: product.title,
    handle: product.handle,
    descriptionHtml: product.descriptionHtml,
    vendor: product.vendor,
    productType: product.productType,
    status: product.status,
    tags: product.tags,
    options: product.options,
    metafields: product.metafields,
  };
}

export function toShopifyVariantInput(variant: TransformedShopifyVariant): ShopifyProductVariantInput {
  return {
    price: variant.price,
    compareAtPrice: variant.compareAtPrice ?? undefined,
    sku: variant.sku ?? undefined,
    barcode: variant.barcode ?? undefined,
    weight: variant.weight ?? undefined,
    weightUnit: variant.weightUnit ?? undefined,
    options: variant.options,
    metafields: variant.metafields,
  };
}
