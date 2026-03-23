export type AlgoliaRootFields =
  | "attributes"
  | "media"
  | "description"
  | "descriptionPlaintext"
  | "categories"
  | "collections"
  | "metadata"
  | "variantMetadata"
  | "otherVariants";

export const AlgoliaRootFieldsLabelsMap = {
  attributes: "Product and variant attributes",
  categories: "Product categories (5 levels)",
  collections: "Product collection names",
  description: "Product description - JSON",
  descriptionPlaintext: "Product description - plain text",
  media: "Variant media (images and videos)",
  metadata: "Product metadata",
  otherVariants: "IDs of other variants of the same product",
  variantMetadata: "Variant metadata",
} satisfies Record<AlgoliaRootFields, string>;

export const AlgoliaRootFieldsKeys = [
  "attributes",
  "media",
  "description",
  "descriptionPlaintext",
  "categories",
  "collections",
  "metadata",
  "variantMetadata",
  "otherVariants",
] as const;

export type AlgoliaPageFields =
  | "content"
  | "contentPlaintext"
  | "seoDescription"
  | "metadata"
  | "attributes";

export const AlgoliaPageFieldsLabelsMap = {
  content: "Page content (JSON)",
  contentPlaintext: "Page content - plain text",
  seoDescription: "SEO description",
  metadata: "Public metadata",
  attributes: "Page attributes",
} satisfies Record<AlgoliaPageFields, string>;

export const AlgoliaPageFieldsKeys = [
  "content",
  "contentPlaintext",
  "seoDescription",
  "metadata",
  "attributes",
] as const;
