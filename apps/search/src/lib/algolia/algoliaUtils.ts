import { EditorJsPlaintextRenderer } from "@saleor/apps-shared";
import {
  ProductAttributesDataFragment,
  ProductVariantWebhookPayloadFragment,
} from "../../../generated/graphql";
import { isNotNil } from "../isNotNil";
import { safeParseJson } from "../safe-parse-json";
import { metadataToAlgoliaAttribute } from "./metadata-to-algolia-attribute";
import { AlgoliaRootFields, AlgoliaRootFieldsKeys } from "../algolia-fields";

type PartialChannelListing = {
  channel: {
    slug: string;
    currencyCode: string;
  };
};

export function channelListingToAlgoliaIndexId(
  channelListing: PartialChannelListing,
  indexNamePrefix: string | undefined,
) {
  /**
   * Index name should not start with . (dot)
   */
  const normalizedPrefix = indexNamePrefix === "" ? undefined : indexNamePrefix;

  const nameSegments = [
    normalizedPrefix,
    channelListing.channel.slug,
    channelListing.channel.currencyCode,
    "products",
  ];

  return nameSegments.filter(isNotNil).join(".");
}

/**
 * Produces category tree in the format expected by hierarchical Algolia widgets, for example:
 *
 * {
 *  "lvl0": "Root Category",
 *  "lvl1": "Root Category > Subcategory"
 *  "lvl2": "Root Category > Subcategory > Sub-subcategory"
 * }
 * https://www.algolia.com/doc/guides/managing-results/refine-results/faceting/#hierarchical-facets
 */
export function categoryHierarchicalFacets({ product }: ProductVariantWebhookPayloadFragment) {
  const categoryParents = [
    product.category?.parent?.parent?.parent?.parent?.name,
    product.category?.parent?.parent?.parent?.name,
    product.category?.parent?.parent?.name,
    product.category?.parent?.name,
    product.category?.name,
  ].filter((category) => category?.length);

  const categoryLvlMapping: Record<string, string> = {};

  for (let i = 0; i < categoryParents.length; i += 1) {
    categoryLvlMapping[`lvl${i}`] = categoryParents.slice(0, i + 1).join(" > ");
  }

  return categoryLvlMapping;
}

export type AlgoliaObject = ReturnType<typeof productAndVariantToAlgolia>;

/**
 *  Returns object with a key being attribute name and value of all attribute values
 *  separated by comma. If no value is selected, an empty string will be used instead.
 */
const mapSelectedAttributesToRecord = (attr: ProductAttributesDataFragment) => {
  if (!attr.attribute.name?.length) {
    return undefined;
  }

  const filteredValues = attr.values.filter((v) => !!v.name?.length);

  return {
    [attr.attribute.name]: filteredValues.map((v) => v.name).join(", ") || "",
  };
};

export function productAndVariantToAlgolia({
  variant,
  channel,
  enabledKeys,
}: {
  variant: ProductVariantWebhookPayloadFragment;
  channel: string;
  enabledKeys: string[];
}) {
  const product = variant.product;
  const attributes = {
    ...product.attributes.reduce((acc, attr, idx) => {
      const preparedAttr = mapSelectedAttributesToRecord(attr);

      if (!preparedAttr) {
        return acc;
      }
      return {
        ...acc,
        ...preparedAttr,
      };
    }, {}),
    ...variant.attributes.reduce((acc, attr, idx) => {
      const preparedAttr = mapSelectedAttributesToRecord(attr);

      if (!preparedAttr) {
        return acc;
      }
      return {
        ...acc,
        ...preparedAttr,
      };
    }, {}),
  };

  const listing = variant.channelListings?.find((l) => l.channel.slug === channel);

  const inStock = !!variant.quantityAvailable;

  const media = variant.product.media?.map((m) => ({ url: m.url, type: m.type })) || [];

  const parentProductPricing = variant.product.channelListings?.find(
    (listing) => listing.channel.slug === channel,
  )?.pricing;

  const document = {
    objectID: productAndVariantToObjectID(variant),
    productId: product.id,
    variantId: variant.id,
    name: `${product.name} - ${variant.name}`,
    productName: product.name,
    variantName: variant.name,
    sku: variant.sku,
    attributes,
    media,
    description: safeParseJson(product.description),
    descriptionPlaintext: EditorJsPlaintextRenderer({ stringData: product.description }),
    slug: product.slug,
    thumbnail: product.thumbnail?.url,
    /**
     * Deprecated
     */
    grossPrice: listing?.price?.amount,
    /**
     * BUG: This will work in bulk-sync, because channel is set in the query.
     * In webhook (like product_variant_updated) pricing is null, so these fields will be purged in Algolia.
     *
     * Need to either add fields to Core (https://github.com/saleor/saleor/issues/14748)
     * or dynamically fetch missing data
     */
    pricing: {
      price: {
        net: variant.pricing?.price?.net.amount,
        gross: variant.pricing?.price?.gross.amount,
      },
      onSale: variant.pricing?.onSale,
      discount: {
        net: variant.pricing?.discount?.net.amount,
        gross: variant.pricing?.discount?.gross.amount,
      },
      priceUndiscounted: {
        net: variant.pricing?.priceUndiscounted?.net.amount,
        gross: variant.pricing?.priceUndiscounted?.gross.amount,
      },
    },
    productPricing: {
      priceRange: {
        start: {
          gross: parentProductPricing?.priceRange?.start?.gross.amount,
          net: parentProductPricing?.priceRange?.start?.net.amount,
        },
        stop: {
          gross: parentProductPricing?.priceRange?.stop?.gross.amount,
          net: parentProductPricing?.priceRange?.stop?.net.amount,
        },
      },
      priceRangeUndiscounted: {
        start: {
          gross: parentProductPricing?.priceRangeUndiscounted?.start?.gross.amount,
          net: parentProductPricing?.priceRangeUndiscounted?.start?.net.amount,
        },
        stop: {
          gross: parentProductPricing?.priceRangeUndiscounted?.stop?.gross.amount,
          net: parentProductPricing?.priceRangeUndiscounted?.stop?.net.amount,
        },
      },
    },
    inStock,
    categories: categoryHierarchicalFacets(variant),
    collections: product.collections?.map((collection) => collection.name) || [],
    metadata: metadataToAlgoliaAttribute(variant.product.metadata),
    variantMetadata: metadataToAlgoliaAttribute(variant.metadata),
    otherVariants: variant.product.variants?.map((v) => v.id).filter((v) => v !== variant.id) || [],
  } satisfies Record<AlgoliaRootFields | string, unknown>;

  // todo refactor
  AlgoliaRootFieldsKeys.forEach((field) => {
    const enabled = enabledKeys.includes(field);

    if (!enabled) {
      delete document[field];
    }
  });

  return document;
}

export function productAndVariantToObjectID({
  product,
  ...variant
}: ProductVariantWebhookPayloadFragment) {
  return `${product.id}_${variant.id}`;
}
