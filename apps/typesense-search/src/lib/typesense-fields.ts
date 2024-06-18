export type TypesenseRootFields =
  | "productId"
  | "variantId"
  | "name"
  | "productName"
  | "variantName"
  | "sku"
  | "attributes"
  | "media"
  | "description"
  | "descriptionPlaintext"
  | "slug"
  | "thumbnail"
  | "grossPrice"
  | "pricing"
  | "productPricing"
  | "inStock"
  | "categories"
  | "collections"
  | "metadata"
  | "variantMetadata"
  | "otherVariants";

export const TypesenseRootFieldsLabelsMap = {
  productId: "Product ID",
  variantId: "Variant ID",
  name: "Name",
  productName: "Product Name",
  variantName: "Variant Name",
  media: "Media",
  descriptionPlaintext: "Description Plaintext",
  slug: "Slug",
  thumbnail: "Thumbnail",
  grossPrice: "Gross Price",
  productPricing: "Product Pricing",
  inStock: "In Stock",
  pricing: "Pricing",
  sku: "SKU",
  attributes: "Attributes",
  description: "Description",
  categories: "Categories",
  collections: "Collections",
  metadata: "Metadata",
  variantMetadata: "Variant Metadata",
  otherVariants: "Other Variants",
} satisfies Record<TypesenseRootFields, string>;

export const TypesenseRootFieldsKeys = [
  "productId",
  "variantId",
  "name",
  "productName",
  "variantName",
  "media",
  "descriptionPlaintext",
  "slug",
  "thumbnail",
  "grossPrice",
  "productPricing",
  "inStock",
  "pricing",
  "sku",
  "attributes",
  "description",
  "categories",
  "collections",
  "metadata",
  "variantMetadata",
  "otherVariants",
] as const;

export const TypesenseRootFieldsTypes = {
  productId: "string",
  variantId: "string",
  name: "string",
  productName: "string",
  variantName: "string",
  media: "string",
  descriptionPlaintext: "string",
  slug: "string",
  thumbnail: "string",
  grossPrice: "int32",
  productPricing: "auto",
  inStock: "bool",
  pricing: "auto",
  sku: "string",
  attributes: "object",
  description: "object",
  categories: "object",
  collections: "auto",
  metadata: "object",
  variantMetadata: "object",
  otherVariants: "auto",
} satisfies Record<TypesenseRootFields, "string" | "int32" | "bool" | "object" | "auto">;

export const requiredFields = [
  { name: "productId", type: "string", facet: false, optional: false },
  { name: "variantId", type: "string", facet: false, optional: false },
  { name: "name", type: "string", facet: false, optional: false },
  { name: "productName", type: "string", facet: false, optional: false },
  { name: "variantName", type: "string", facet: false, optional: true },
  { name: "media", type: "string", facet: false, optional: true },
  { name: "descriptionPlaintext", type: "string", facet: false, optional: true },
  { name: "slug", type: "string", facet: false, optional: true },
  { name: "thumbnail", type: "string", facet: false, optional: true },
  { name: "grossPrice", type: "int32", facet: false, optional: true },
  { name: "productPricing", type: "auto", facet: false, optional: true },
  { name: "inStock", type: "bool", facet: false, optional: true },
  { name: "pricing", type: "auto", facet: false, optional: true },
  { name: "sku", type: "string", facet: false, optional: true },
  { name: "attributes", type: "object", facet: false, optional: true },
  { name: "description", type: "object", facet: false, optional: true },
  { name: "categories", type: "object", facet: true, optional: true },
  { name: "collections", type: "auto", facet: true, optional: true },
  { name: "metadata", type: "object", facet: false, optional: true },
  { name: "variantMetadata", type: "object", facet: false, optional: true },
  { name: "otherVariants", type: "auto", facet: false, optional: true },
];
