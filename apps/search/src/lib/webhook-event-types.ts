import type {
  CategoryCreatedSubscription,
  CategoryDeletedSubscription,
  CategoryUpdatedSubscription,
  ProductCreatedSubscription,
  ProductDeletedSubscription,
  ProductUpdatedSubscription,
  ProductVariantBackInStockSubscription,
  ProductVariantCreatedSubscription,
  ProductVariantDeletedSubscription,
  ProductVariantOutOfStockSubscription,
  ProductVariantUpdatedSubscription,
} from "../../generated/graphql";

export type CategoryCreated = Extract<
  NonNullable<CategoryCreatedSubscription["event"]>,
  { __typename: "CategoryCreated" }
>;
export type CategoryDeleted = Extract<
  NonNullable<CategoryDeletedSubscription["event"]>,
  { __typename: "CategoryDeleted" }
>;
export type CategoryUpdated = Extract<
  NonNullable<CategoryUpdatedSubscription["event"]>,
  { __typename: "CategoryUpdated" }
>;
export type ProductCreated = Extract<
  NonNullable<ProductCreatedSubscription["event"]>,
  { __typename: "ProductCreated" }
>;
export type ProductDeleted = Extract<
  NonNullable<ProductDeletedSubscription["event"]>,
  { __typename: "ProductDeleted" }
>;
export type ProductUpdated = Extract<
  NonNullable<ProductUpdatedSubscription["event"]>,
  { __typename: "ProductUpdated" }
>;
export type ProductVariantBackInStock = Extract<
  NonNullable<ProductVariantBackInStockSubscription["event"]>,
  { __typename: "ProductVariantBackInStock" }
>;
export type ProductVariantCreated = Extract<
  NonNullable<ProductVariantCreatedSubscription["event"]>,
  { __typename: "ProductVariantCreated" }
>;
export type ProductVariantDeleted = Extract<
  NonNullable<ProductVariantDeletedSubscription["event"]>,
  { __typename: "ProductVariantDeleted" }
>;
export type ProductVariantOutOfStock = Extract<
  NonNullable<ProductVariantOutOfStockSubscription["event"]>,
  { __typename: "ProductVariantOutOfStock" }
>;
export type ProductVariantUpdated = Extract<
  NonNullable<ProductVariantUpdatedSubscription["event"]>,
  { __typename: "ProductVariantUpdated" }
>;

export type { MetadataItemFragment as MetadataItem } from "../../generated/graphql";
