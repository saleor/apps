import gql from 'graphql-tag';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
type JSONValue = string | number | boolean | null | { [key: string]: JSONValue } | JSONValue[];
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /**
   * The `Date` scalar type represents a Date
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  Date: { input: string; output: string; }
  /**
   * The `DateTime` scalar type represents a DateTime
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: { input: string; output: string; }
  /** The `Day` scalar type represents number of days by integer value. */
  Day: { input: string; output: string; }
  /**
   * Custom Decimal implementation.
   *
   * Returns Decimal as a float in the API,
   * parses float to the Decimal on the way back.
   */
  Decimal: { input: number; output: number; }
  /**
   * The `GenericScalar` scalar type represents a generic
   * GraphQL scalar value that could be:
   * String, Boolean, Int, Float, List or Object.
   */
  GenericScalar: { input: JSONValue; output: JSONValue; }
  /** The `Hour` scalar type represents number of hours by integer value. */
  Hour: { input: number; output: number; }
  JSON: { input: JSONValue; output: JSONValue; }
  JSONString: { input: string; output: string; }
  /**
   * Metadata is a map of key-value pairs, both keys and values are `String`.
   *
   * Example:
   * ```
   * {
   *     "key1": "value1",
   *     "key2": "value2"
   * }
   * ```
   */
  Metadata: { input: Record<string, string>; output: Record<string, string>; }
  /** The `Minute` scalar type represents number of minutes by integer value. */
  Minute: { input: number; output: number; }
  /**
   * Nonnegative Decimal scalar implementation.
   *
   * Should be used in places where value must be nonnegative (0 or greater).
   */
  PositiveDecimal: { input: number; output: number; }
  /**
   * Positive Integer scalar implementation.
   *
   * Should be used in places where value must be positive (greater than 0).
   */
  PositiveInt: { input: number; output: number; }
  UUID: { input: string; output: string; }
  /** Variables of this type must be set to null in mutations. They will be replaced with a filename from a following multipart part containing a binary file. See: https://github.com/jaydenseric/graphql-multipart-request-spec. */
  Upload: { input: unknown; output: unknown; }
  WeightScalar: { input: number; output: number; }
  /** _Any value scalar as defined by Federation spec. */
  _Any: { input: unknown; output: unknown; }
};

export type MetadataInput = {
  /** Key of a metadata item. */
  key: Scalars['String']['input'];
  /** Value of a metadata item. */
  value: Scalars['String']['input'];
};

export type BulkImportProductFragment = { id: string, name: string, slug: string, variants?: Array<{ id: string, name: string, sku?: string | null, channelListings?: Array<{ channel: { id: string, slug: string }, price?: { amount: number, currency: string } | null }> | null }> | null };

export type WebhookProductFragment = { id: string, name: string, slug: string, channelListings?: Array<{ id: string, channel: { id: string, slug: string } }> | null, variants?: Array<{ id: string, name: string, channelListings?: Array<{ channel: { id: string, slug: string }, price?: { amount: number, currency: string } | null }> | null }> | null };

export type WebhookProductVariantFragment = { id: string, name: string, sku?: string | null, product: { id: string, name: string, slug: string }, channelListings?: Array<{ channel: { id: string, slug: string }, price?: { amount: number, currency: string } | null }> | null };

export type UpdateAppMetadataMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: Array<MetadataInput> | MetadataInput;
}>;


export type UpdateAppMetadataMutation = { updatePrivateMetadata?: { item?: { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | { privateMetadata: Array<{ key: string, value: string }> } | null } | null };

export type FetchChannelsQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchChannelsQuery = { channels?: Array<{ id: string, slug: string, name: string }> | null };

export type FetchProductsPaginatedQueryVariables = Exact<{
  channel?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type FetchProductsPaginatedQuery = { products?: { pageInfo: { hasNextPage: boolean, endCursor?: string | null }, edges: Array<{ node: { id: string, name: string, slug: string, variants?: Array<{ id: string, name: string, sku?: string | null, channelListings?: Array<{ channel: { id: string, slug: string }, price?: { amount: number, currency: string } | null }> | null }> | null } }> } | null };

export type ProductUpdatedWebhookPayloadFragment = { product?: { id: string, name: string, slug: string, channelListings?: Array<{ id: string, channel: { id: string, slug: string } }> | null, variants?: Array<{ id: string, name: string, channelListings?: Array<{ channel: { id: string, slug: string }, price?: { amount: number, currency: string } | null }> | null }> | null } | null };

export type ProductUpdatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type ProductUpdatedSubscription = { event?: { product?: { id: string, name: string, slug: string, channelListings?: Array<{ id: string, channel: { id: string, slug: string } }> | null, variants?: Array<{ id: string, name: string, channelListings?: Array<{ channel: { id: string, slug: string }, price?: { amount: number, currency: string } | null }> | null }> | null } | null } | {} | null };

export type ProductVariantCreatedWebhookPayloadFragment = { productVariant?: { id: string, name: string, sku?: string | null, product: { id: string, name: string, slug: string }, channelListings?: Array<{ channel: { id: string, slug: string }, price?: { amount: number, currency: string } | null }> | null } | null };

export type ProductVariantCreatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type ProductVariantCreatedSubscription = { event?: { productVariant?: { id: string, name: string, sku?: string | null, product: { id: string, name: string, slug: string }, channelListings?: Array<{ channel: { id: string, slug: string }, price?: { amount: number, currency: string } | null }> | null } | null } | {} | null };

export type ProductVariantDeletedWebhookPayloadFragment = { productVariant?: { id: string, name: string, sku?: string | null, product: { id: string, name: string, slug: string }, channelListings?: Array<{ channel: { id: string, slug: string }, price?: { amount: number, currency: string } | null }> | null } | null };

export type ProductVariantDeletedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type ProductVariantDeletedSubscription = { event?: { productVariant?: { id: string, name: string, sku?: string | null, product: { id: string, name: string, slug: string }, channelListings?: Array<{ channel: { id: string, slug: string }, price?: { amount: number, currency: string } | null }> | null } | null } | {} | null };

export type ProductVariantUpdatedWebhookPayloadFragment = { productVariant?: { id: string, name: string, sku?: string | null, product: { id: string, name: string, slug: string }, channelListings?: Array<{ channel: { id: string, slug: string }, price?: { amount: number, currency: string } | null }> | null } | null };

export type ProductVariantUpdatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type ProductVariantUpdatedSubscription = { event?: { productVariant?: { id: string, name: string, sku?: string | null, product: { id: string, name: string, slug: string }, channelListings?: Array<{ channel: { id: string, slug: string }, price?: { amount: number, currency: string } | null }> | null } | null } | {} | null };

export const UntypedBulkImportProductFragmentDoc = gql`
    fragment BulkImportProduct on Product {
  id
  name
  slug
  variants {
    id
    name
    sku
    channelListings {
      channel {
        id
        slug
      }
      price {
        amount
        currency
      }
    }
  }
}
    `;
export const UntypedWebhookProductFragmentDoc = gql`
    fragment WebhookProduct on Product {
  id
  name
  slug
  channelListings {
    id
    channel {
      id
      slug
    }
  }
  variants {
    id
    name
    channelListings {
      channel {
        id
        slug
      }
      price {
        amount
        currency
      }
    }
  }
}
    `;
export const UntypedProductUpdatedWebhookPayloadFragmentDoc = gql`
    fragment ProductUpdatedWebhookPayload on ProductUpdated {
  product {
    ...WebhookProduct
  }
}
    `;
export const UntypedWebhookProductVariantFragmentDoc = gql`
    fragment WebhookProductVariant on ProductVariant {
  id
  name
  sku
  product {
    id
    name
    slug
  }
  channelListings {
    channel {
      id
      slug
    }
    price {
      amount
      currency
    }
  }
}
    `;
export const UntypedProductVariantCreatedWebhookPayloadFragmentDoc = gql`
    fragment ProductVariantCreatedWebhookPayload on ProductVariantCreated {
  productVariant {
    ...WebhookProductVariant
  }
}
    `;
export const UntypedProductVariantDeletedWebhookPayloadFragmentDoc = gql`
    fragment ProductVariantDeletedWebhookPayload on ProductVariantDeleted {
  productVariant {
    ...WebhookProductVariant
  }
}
    `;
export const UntypedProductVariantUpdatedWebhookPayloadFragmentDoc = gql`
    fragment ProductVariantUpdatedWebhookPayload on ProductVariantUpdated {
  productVariant {
    ...WebhookProductVariant
  }
}
    `;
export const UntypedUpdateAppMetadataDocument = gql`
    mutation UpdateAppMetadata($id: ID!, $input: [MetadataInput!]!) {
  updatePrivateMetadata(id: $id, input: $input) {
    item {
      privateMetadata {
        key
        value
      }
    }
  }
}
    `;
export const UntypedFetchChannelsDocument = gql`
    query FetchChannels {
  channels {
    id
    slug
    name
  }
}
    `;
export const UntypedFetchProductsPaginatedDocument = gql`
    query FetchProductsPaginated($channel: String, $after: String) {
  products(first: 100, channel: $channel, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        ...BulkImportProduct
      }
    }
  }
}
    ${UntypedBulkImportProductFragmentDoc}`;
export const UntypedProductUpdatedDocument = gql`
    subscription ProductUpdated {
  event {
    ...ProductUpdatedWebhookPayload
  }
}
    ${UntypedProductUpdatedWebhookPayloadFragmentDoc}
${UntypedWebhookProductFragmentDoc}`;
export const UntypedProductVariantCreatedDocument = gql`
    subscription ProductVariantCreated {
  event {
    ...ProductVariantCreatedWebhookPayload
  }
}
    ${UntypedProductVariantCreatedWebhookPayloadFragmentDoc}
${UntypedWebhookProductVariantFragmentDoc}`;
export const UntypedProductVariantDeletedDocument = gql`
    subscription ProductVariantDeleted {
  event {
    ...ProductVariantDeletedWebhookPayload
  }
}
    ${UntypedProductVariantDeletedWebhookPayloadFragmentDoc}
${UntypedWebhookProductVariantFragmentDoc}`;
export const UntypedProductVariantUpdatedDocument = gql`
    subscription ProductVariantUpdated {
  event {
    ...ProductVariantUpdatedWebhookPayload
  }
}
    ${UntypedProductVariantUpdatedWebhookPayloadFragmentDoc}
${UntypedWebhookProductVariantFragmentDoc}`;
export const BulkImportProductFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BulkImportProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"variants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"channelListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}}]}}]}}]} as unknown as DocumentNode<BulkImportProductFragment, unknown>;
export const WebhookProductFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"channelListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"variants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"channelListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}}]}}]}}]} as unknown as DocumentNode<WebhookProductFragment, unknown>;
export const ProductUpdatedWebhookPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductUpdatedWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductUpdated"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookProduct"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"channelListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"variants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"channelListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ProductUpdatedWebhookPayloadFragment, unknown>;
export const WebhookProductVariantFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookProductVariant"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"channelListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}}]}}]} as unknown as DocumentNode<WebhookProductVariantFragment, unknown>;
export const ProductVariantCreatedWebhookPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductVariantCreatedWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariantCreated"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookProductVariant"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookProductVariant"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"channelListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}}]}}]} as unknown as DocumentNode<ProductVariantCreatedWebhookPayloadFragment, unknown>;
export const ProductVariantDeletedWebhookPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductVariantDeletedWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariantDeleted"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookProductVariant"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookProductVariant"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"channelListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}}]}}]} as unknown as DocumentNode<ProductVariantDeletedWebhookPayloadFragment, unknown>;
export const ProductVariantUpdatedWebhookPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductVariantUpdatedWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariantUpdated"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookProductVariant"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookProductVariant"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"channelListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}}]}}]} as unknown as DocumentNode<ProductVariantUpdatedWebhookPayloadFragment, unknown>;
export const UpdateAppMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAppMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePrivateMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdateAppMetadataMutation, UpdateAppMetadataMutationVariables>;
export const FetchChannelsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchChannels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<FetchChannelsQuery, FetchChannelsQueryVariables>;
export const FetchProductsPaginatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchProductsPaginated"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"channel"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}},{"kind":"Argument","name":{"kind":"Name","value":"channel"},"value":{"kind":"Variable","name":{"kind":"Name","value":"channel"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BulkImportProduct"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BulkImportProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"variants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"channelListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}}]}}]}}]} as unknown as DocumentNode<FetchProductsPaginatedQuery, FetchProductsPaginatedQueryVariables>;
export const ProductUpdatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"ProductUpdated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductUpdatedWebhookPayload"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"channelListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"variants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"channelListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductUpdatedWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductUpdated"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookProduct"}}]}}]}}]} as unknown as DocumentNode<ProductUpdatedSubscription, ProductUpdatedSubscriptionVariables>;
export const ProductVariantCreatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"ProductVariantCreated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductVariantCreatedWebhookPayload"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookProductVariant"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"channelListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductVariantCreatedWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariantCreated"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookProductVariant"}}]}}]}}]} as unknown as DocumentNode<ProductVariantCreatedSubscription, ProductVariantCreatedSubscriptionVariables>;
export const ProductVariantDeletedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"ProductVariantDeleted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductVariantDeletedWebhookPayload"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookProductVariant"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"channelListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductVariantDeletedWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariantDeleted"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookProductVariant"}}]}}]}}]} as unknown as DocumentNode<ProductVariantDeletedSubscription, ProductVariantDeletedSubscriptionVariables>;
export const ProductVariantUpdatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"ProductVariantUpdated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductVariantUpdatedWebhookPayload"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookProductVariant"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"channelListings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductVariantUpdatedWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariantUpdated"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookProductVariant"}}]}}]}}]} as unknown as DocumentNode<ProductVariantUpdatedSubscription, ProductVariantUpdatedSubscriptionVariables>;