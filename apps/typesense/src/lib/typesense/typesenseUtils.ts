import { EditorJsPlaintextRenderer } from "@saleor/apps-shared";
import {
  AttributeInputTypeEnum,
  ProductAttributesDataFragment,
  ProductVariantWebhookPayloadFragment,
} from "../../../generated/graphql";
import { isNotNil } from "../isNotNil";
import { safeParseJson } from "../safe-parse-json";
import { metadataToTypesenseAttribute } from "./metadata-to-typesense-attribute";
import { TypesenseRootFields, TypesenseRootFieldsKeys } from "../typesense-fields";

type PartialChannelListing = {
  channel: {
    slug: string;
    currencyCode: string;
  };
};

export function channelListingToTypesenseIndexId(
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

export type TypesenseObject = ReturnType<typeof productAndVariantToTypesense>;

const isAttributeValueBooleanType = (
  attributeValue: ProductAttributesDataFragment["values"],
): attributeValue is [{ boolean: boolean; inputType: AttributeInputTypeEnum.Boolean }] => {
  return (
    /**
     * Boolean type can be only a single value. List API exists due to multi-value fields like multiselects
     */
    attributeValue.length === 1 &&
    attributeValue[0].inputType === AttributeInputTypeEnum.Boolean &&
    typeof attributeValue[0].boolean === "boolean"
  );
};

/**
 *  Returns object with a key being attribute name and value of all attribute values
 *  separated by comma. If no value is selected, an empty string will be used instead.
 */
const mapSelectedAttributesToRecord = (attr: ProductAttributesDataFragment) => {
  if (!attr.attribute.name?.length) {
    return undefined;
  }

  /**
   * TODO: How/When name can be empty?
   */
  const filteredValues = attr.values.filter((v) => !!v.name?.length);

  let value: string | boolean;

  /**
   * Strategy for boolean type only
   * REF SHOPX-332
   * TODO: Other input types should be handled and properly mapped
   */
  if (isAttributeValueBooleanType(filteredValues)) {
    value = filteredValues[0].boolean;
  } else {
    /**
     * Fallback to initial/previous behavior
     * TODO: Its not correct to use "name" field always. E.g. for plaintext field more accurate is "plainText",
     *   for "date" field there are date and dateTime fields. "Name" can work on the frontend but doesn't fit for faceting
     */
    value = filteredValues.map((v) => v.name).join(", ") || "";
  }

  return {
    [attr.attribute.name]: value,
  } as Record<string, string | boolean>;
};

export function productAndVariantToTypesense({
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

  const parentProductPricing = variant.product.channelListings?.find(
    (listing) => listing.channel.slug === channel,
  )?.pricing;

  const document = {
    id: productAndVariantToObjectID(variant),
    productId: product.id,
    variantId: variant.id,
    name: `${product.name} - ${variant.name}`,
    productName: product.name,
    variantName: variant.name,
    sku: variant.sku,
    attributes,
    media: variant.product.media?.map((m) => m.url)[0] || "",
    description: safeParseJson(product.description),
    descriptionPlaintext: EditorJsPlaintextRenderer({ stringData: product.description }),
    slug: product.slug,
    thumbnail: product.thumbnail?.url,
    grossPrice: listing?.price?.amount,
    pricing: {
      price: {
        net: variant.pricing?.price?.net.amount ?? 0,
        gross: variant.pricing?.price?.gross.amount ?? 0,
      },
      onSale: variant.pricing?.onSale,
      discount: {
        net: variant.pricing?.discount?.net.amount ?? 0,
        gross: variant.pricing?.discount?.gross.amount ?? 0,
      },
      priceUndiscounted: {
        net: variant.pricing?.priceUndiscounted?.net.amount ?? 0,
        gross: variant.pricing?.priceUndiscounted?.gross.amount ?? 0,
      },
    },
    productPricing: {
      priceRange: {
        start: {
          gross: parentProductPricing?.priceRange?.start?.gross.amount ?? 0,
          net: parentProductPricing?.priceRange?.start?.net.amount ?? 0,
        },
        stop: {
          gross: parentProductPricing?.priceRange?.stop?.gross.amount ?? 0,
          net: parentProductPricing?.priceRange?.stop?.net.amount ?? 0,
        },
      },
      priceRangeUndiscounted: {
        start: {
          gross: parentProductPricing?.priceRangeUndiscounted?.start?.gross.amount ?? 0,
          net: parentProductPricing?.priceRangeUndiscounted?.start?.net.amount ?? 0,
        },
        stop: {
          gross: parentProductPricing?.priceRangeUndiscounted?.stop?.gross.amount ?? 0,
          net: parentProductPricing?.priceRangeUndiscounted?.stop?.net.amount ?? 0,
        },
      },
    },
    inStock,
    categories: categoryHierarchicalFacets(variant),
    collections: product.collections?.map((collection) => collection.name) || [],
    metadata: metadataToTypesenseAttribute(variant.product.metadata),
    variantMetadata: metadataToTypesenseAttribute(variant.metadata),
    otherVariants: variant.product.variants?.map((v) => v.id).filter((v) => v !== variant.id) || [],
  } satisfies Record<TypesenseRootFields | string, unknown>;

  // todo refactor
  TypesenseRootFieldsKeys.forEach((field) => {
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

// Handles the case when the field is not present in the document but is present in the schema
export function getDefaultFieldValue(field: TypesenseRootFields) {
  switch (field) {
    case "productId":
    case "variantId":
    case "name":
    case "productName":
    case "variantName":
    case "media":
    case "descriptionPlaintext":
    case "slug":
    case "thumbnail":
    case "productPricing":
      return "";
    case "grossPrice":
      return 0;
    case "inStock":
      return false;
    default:
      return null;
  }
}
