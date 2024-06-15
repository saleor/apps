export type TypesenseRootFields =
  | "productId"
  | "variantId"
  | "name"
  | "productName"
  | "variantName"
  | "media"
  | "descriptionPlaintext"
  | "slug"
  | "thumbnail"
  | "grossPrice"
  | "productPricing"
  | "inStock";

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
  productPricing: "object",
  inStock: "bool",
} satisfies Record<TypesenseRootFields, "string" | "int32" | "bool" | "object">;

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
  { name: "productPricing", type: "object", facet: false, optional: true },
  { name: "inStock", type: "bool", facet: false, optional: true },
];
