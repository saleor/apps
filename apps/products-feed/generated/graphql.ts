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

export type ProductMediaType =
  | 'IMAGE'
  | 'VIDEO';

export type WeightUnitsEnum =
  | 'G'
  | 'KG'
  | 'LB'
  | 'OZ'
  | 'TONNE';

export type AttributeWithMappingFragmentFragment = { __typename?: 'Attribute', id: string, name: string, slug: string };

export type BasicProductDataFragment = { __typename?: 'ProductVariant', id: string, name: string, sku?: string | null, quantityAvailable?: number | null, product: { __typename?: 'Product', id: string }, weight?: { __typename?: 'Weight', unit: WeightUnitsEnum, value: number } | null, pricing?: { __typename?: 'VariantPricingInfo', priceUndiscounted?: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', currency: string, amount: number } } | null, price?: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', currency: string, amount: number } } | null } | null };

export type CategoryWithMappingFragmentFragment = { __typename?: 'Category', id: string, name: string, googleCategoryId?: string | null, parent?: { __typename?: 'Category', name: string, parent?: { __typename?: 'Category', name: string } | null } | null };

export type GoogleFeedProductVariantFragment = { __typename?: 'ProductVariant', id: string, name: string, sku?: string | null, quantityAvailable?: number | null, weight?: { __typename?: 'Weight', unit: WeightUnitsEnum, value: number } | null, pricing?: { __typename?: 'VariantPricingInfo', priceUndiscounted?: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', currency: string, amount: number } } | null, price?: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', currency: string, amount: number } } | null } | null, attributes: Array<{ __typename?: 'SelectedAttribute', attribute: { __typename?: 'Attribute', id: string }, values: Array<{ __typename?: 'AttributeValue', value?: string | null, name?: string | null }> }>, product: { __typename?: 'Product', id: string, name: string, slug: string, description?: string | null, seoDescription?: string | null, productType: { __typename?: 'ProductType', isShippingRequired: boolean }, media?: Array<{ __typename?: 'ProductMedia', id: string, alt: string, url: string, type: ProductMediaType }> | null, variants?: Array<{ __typename?: 'ProductVariant', id: string, media?: Array<{ __typename?: 'ProductMedia', id: string, alt: string, url: string, type: ProductMediaType }> | null }> | null, attributes: Array<{ __typename?: 'SelectedAttribute', attribute: { __typename?: 'Attribute', id: string }, values: Array<{ __typename?: 'AttributeValue', value?: string | null, name?: string | null }> }>, thumbnail?: { __typename?: 'Image', url: string } | null, category?: { __typename?: 'Category', id: string, name: string, googleCategoryId?: string | null } | null } };

export type ProductAttributesFragment = { __typename?: 'ProductVariant', id: string, attributes: Array<{ __typename?: 'SelectedAttribute', attribute: { __typename?: 'Attribute', id: string }, values: Array<{ __typename?: 'AttributeValue', value?: string | null, name?: string | null }> }> };

export type RelatedProductsFragment = { __typename?: 'Product', id: string, name: string, slug: string, description?: string | null, seoDescription?: string | null, productType: { __typename?: 'ProductType', isShippingRequired: boolean }, media?: Array<{ __typename?: 'ProductMedia', id: string, alt: string, url: string, type: ProductMediaType }> | null, variants?: Array<{ __typename?: 'ProductVariant', id: string, media?: Array<{ __typename?: 'ProductMedia', id: string, alt: string, url: string, type: ProductMediaType }> | null }> | null, attributes: Array<{ __typename?: 'SelectedAttribute', attribute: { __typename?: 'Attribute', id: string }, values: Array<{ __typename?: 'AttributeValue', value?: string | null, name?: string | null }> }>, thumbnail?: { __typename?: 'Image', url: string } | null, category?: { __typename?: 'Category', id: string, name: string, googleCategoryId?: string | null } | null };

export type WeightFragment = { __typename?: 'Weight', unit: WeightUnitsEnum, value: number };

export type DeleteAppMetadataMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  keys: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type DeleteAppMetadataMutation = { __typename?: 'Mutation', deletePrivateMetadata?: { __typename?: 'DeletePrivateMetadata', item?: { __typename?: 'Address', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Attribute', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Category', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Channel', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Checkout', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'CheckoutLine', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Collection', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Fulfillment', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'GiftCard', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Invoice', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Menu', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'MenuItem', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Order', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'OrderLine', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Page', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'PageType', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Payment', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Product', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductMedia', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductType', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductVariant', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Promotion', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Sale', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingMethod', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingMethodType', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingZone', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Shop', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TaxClass', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TaxConfiguration', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TransactionItem', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'User', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Voucher', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Warehouse', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | null };

export type UpdateAppMetadataMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: Array<MetadataInput> | MetadataInput;
}>;


export type UpdateAppMetadataMutation = { __typename?: 'Mutation', updatePrivateMetadata?: { __typename?: 'UpdatePrivateMetadata', item?: { __typename?: 'Address', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Attribute', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Category', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Channel', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Checkout', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'CheckoutLine', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Collection', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Fulfillment', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'GiftCard', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Invoice', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Menu', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'MenuItem', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Order', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'OrderLine', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Page', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'PageType', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Payment', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Product', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductMedia', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductType', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductVariant', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Promotion', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Sale', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingMethod', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingMethodType', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingZone', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Shop', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TaxClass', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TaxConfiguration', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TransactionItem', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'User', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Voucher', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Warehouse', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | null };

export type UpdateCategoryMappingMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  googleCategoryId: Scalars['String']['input'];
}>;


export type UpdateCategoryMappingMutation = { __typename?: 'Mutation', updateMetadata?: { __typename?: 'UpdateMetadata', errors: Array<{ __typename?: 'MetadataError', message?: string | null }> } | null };

export type FetchAppDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchAppDetailsQuery = { __typename?: 'Query', app?: { __typename?: 'App', id: string, privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

export type FetchAttributesWithMappingQueryVariables = Exact<{
  cursor?: InputMaybe<Scalars['String']['input']>;
}>;


export type FetchAttributesWithMappingQuery = { __typename?: 'Query', attributes?: { __typename?: 'AttributeCountableConnection', pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null }, edges: Array<{ __typename?: 'AttributeCountableEdge', node: { __typename?: 'Attribute', id: string, name: string, slug: string } }> } | null };

export type FetchProductVariantsDataQueryVariables = Exact<{
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
  channel: Scalars['String']['input'];
}>;


export type FetchProductVariantsDataQuery = { __typename?: 'Query', productVariants?: { __typename?: 'ProductVariantCountableConnection', pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null }, edges: Array<{ __typename?: 'ProductVariantCountableEdge', node: { __typename?: 'ProductVariant', id: string, name: string, sku?: string | null, quantityAvailable?: number | null, product: { __typename?: 'Product', id: string }, weight?: { __typename?: 'Weight', unit: WeightUnitsEnum, value: number } | null, pricing?: { __typename?: 'VariantPricingInfo', priceUndiscounted?: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', currency: string, amount: number } } | null, price?: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', currency: string, amount: number } } | null } | null, attributes: Array<{ __typename?: 'SelectedAttribute', attribute: { __typename?: 'Attribute', id: string }, values: Array<{ __typename?: 'AttributeValue', value?: string | null, name?: string | null }> }> } }> } | null };

export type FetchCategoriesWithMappingQueryVariables = Exact<{
  cursor?: InputMaybe<Scalars['String']['input']>;
}>;


export type FetchCategoriesWithMappingQuery = { __typename?: 'Query', categories?: { __typename?: 'CategoryCountableConnection', pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null }, edges: Array<{ __typename?: 'CategoryCountableEdge', node: { __typename?: 'Category', id: string, name: string, googleCategoryId?: string | null, parent?: { __typename?: 'Category', name: string, parent?: { __typename?: 'Category', name: string } | null } | null } }> } | null };

export type FetchProductCursorsQueryVariables = Exact<{
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
  channel: Scalars['String']['input'];
}>;


export type FetchProductCursorsQuery = { __typename?: 'Query', productVariants?: { __typename?: 'ProductVariantCountableConnection', pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type FetchRelatedProductsDataQueryVariables = Exact<{
  ids?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
  imageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type FetchRelatedProductsDataQuery = { __typename?: 'Query', products?: { __typename?: 'ProductCountableConnection', edges: Array<{ __typename?: 'ProductCountableEdge', node: { __typename?: 'Product', id: string, name: string, slug: string, description?: string | null, seoDescription?: string | null, productType: { __typename?: 'ProductType', isShippingRequired: boolean }, media?: Array<{ __typename?: 'ProductMedia', id: string, alt: string, url: string, type: ProductMediaType }> | null, variants?: Array<{ __typename?: 'ProductVariant', id: string, media?: Array<{ __typename?: 'ProductMedia', id: string, alt: string, url: string, type: ProductMediaType }> | null }> | null, attributes: Array<{ __typename?: 'SelectedAttribute', attribute: { __typename?: 'Attribute', id: string }, values: Array<{ __typename?: 'AttributeValue', value?: string | null, name?: string | null }> }>, thumbnail?: { __typename?: 'Image', url: string } | null, category?: { __typename?: 'Category', id: string, name: string, googleCategoryId?: string | null } | null } }> } | null };

export type ShopDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type ShopDetailsQuery = { __typename?: 'Query', shop: { __typename?: 'Shop', name: string, description?: string | null } };

export type ChannelFragment = { __typename?: 'Channel', name: string, id: string, slug: string };

export type FetchChannelsQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchChannelsQuery = { __typename?: 'Query', channels?: Array<{ __typename?: 'Channel', name: string, id: string, slug: string }> | null };

export const UntypedAttributeWithMappingFragmentFragmentDoc = gql`
    fragment AttributeWithMappingFragment on Attribute {
  id
  name
  slug
}
    `;
export const UntypedBasicProductDataFragmentDoc = gql`
    fragment BasicProductData on ProductVariant {
  id
  name
  sku
  product {
    id
  }
  weight {
    unit
    value
  }
  pricing {
    priceUndiscounted {
      gross {
        currency
        amount
      }
    }
    price {
      gross {
        currency
        amount
      }
    }
  }
  quantityAvailable
}
    `;
export const UntypedCategoryWithMappingFragmentFragmentDoc = gql`
    fragment CategoryWithMappingFragment on Category {
  id
  parent {
    name
    parent {
      name
    }
  }
  name
  googleCategoryId: metafield(key: "google_category_id")
}
    `;
export const UntypedGoogleFeedProductVariantFragmentDoc = gql`
    fragment GoogleFeedProductVariant on ProductVariant {
  id
  name
  sku
  weight {
    unit
    value
  }
  pricing {
    priceUndiscounted {
      gross {
        currency
        amount
      }
    }
    price {
      gross {
        currency
        amount
      }
    }
  }
  quantityAvailable
  attributes {
    attribute {
      id
    }
    values {
      value
      name
    }
  }
  product {
    id
    name
    slug
    description
    seoDescription
    productType {
      isShippingRequired
    }
    media {
      id
      alt
      url(size: $imageSize)
      type
    }
    variants {
      id
      media {
        id
        alt
        url(size: $imageSize)
        type
      }
    }
    attributes {
      attribute {
        id
      }
      values {
        value
        name
      }
    }
    thumbnail(size: $imageSize) {
      url
    }
    category {
      id
      name
      googleCategoryId: metafield(key: "google_category_id")
    }
  }
}
    `;
export const UntypedProductAttributesFragmentDoc = gql`
    fragment ProductAttributes on ProductVariant {
  id
  attributes {
    attribute {
      id
    }
    values {
      value
      name
    }
  }
}
    `;
export const UntypedRelatedProductsFragmentDoc = gql`
    fragment RelatedProducts on Product {
  id
  name
  slug
  description
  seoDescription
  productType {
    isShippingRequired
  }
  media {
    id
    alt
    url(size: $imageSize)
    type
  }
  variants {
    id
    media {
      id
      alt
      url(size: $imageSize)
      type
    }
  }
  attributes {
    attribute {
      id
    }
    values {
      value
      name
    }
  }
  thumbnail(size: $imageSize) {
    url
  }
  category {
    id
    name
    googleCategoryId: metafield(key: "google_category_id")
  }
}
    `;
export const UntypedWeightFragmentDoc = gql`
    fragment Weight on Weight {
  unit
  value
}
    `;
export const UntypedChannelFragmentDoc = gql`
    fragment Channel on Channel {
  name
  id
  slug
}
    `;
export const UntypedDeleteAppMetadataDocument = gql`
    mutation DeleteAppMetadata($id: ID!, $keys: [String!]!) {
  deletePrivateMetadata(id: $id, keys: $keys) {
    item {
      privateMetadata {
        key
        value
      }
    }
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
export const UntypedUpdateCategoryMappingDocument = gql`
    mutation UpdateCategoryMapping($id: ID!, $googleCategoryId: String!) {
  updateMetadata(
    id: $id
    input: {key: "google_category_id", value: $googleCategoryId}
  ) {
    errors {
      message
    }
  }
}
    `;
export const UntypedFetchAppDetailsDocument = gql`
    query FetchAppDetails {
  app {
    id
    privateMetadata {
      key
      value
    }
  }
}
    `;
export const UntypedFetchAttributesWithMappingDocument = gql`
    query FetchAttributesWithMapping($cursor: String) {
  attributes(first: 100, after: $cursor) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        ...AttributeWithMappingFragment
      }
    }
  }
}
    ${UntypedAttributeWithMappingFragmentFragmentDoc}`;
export const UntypedFetchProductVariantsDataDocument = gql`
    query FetchProductVariantsData($first: Int!, $after: String, $channel: String!) {
  productVariants(
    first: $first
    after: $after
    channel: $channel
    sortBy: {field: LAST_MODIFIED_AT, direction: ASC}
  ) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        ...BasicProductData
        ...ProductAttributes
      }
    }
  }
}
    ${UntypedBasicProductDataFragmentDoc}
${UntypedProductAttributesFragmentDoc}`;
export const UntypedFetchCategoriesWithMappingDocument = gql`
    query FetchCategoriesWithMapping($cursor: String) {
  categories(first: 100, after: $cursor) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        ...CategoryWithMappingFragment
      }
    }
  }
}
    ${UntypedCategoryWithMappingFragmentFragmentDoc}`;
export const UntypedFetchProductCursorsDocument = gql`
    query FetchProductCursors($first: Int!, $after: String, $channel: String!) {
  productVariants(
    first: $first
    after: $after
    channel: $channel
    sortBy: {direction: ASC, field: LAST_MODIFIED_AT}
  ) {
    pageInfo {
      hasNextPage
      startCursor
      endCursor
    }
  }
}
    `;
export const UntypedFetchRelatedProductsDataDocument = gql`
    query FetchRelatedProductsData($ids: [ID!], $imageSize: Int = 1024) {
  products(filter: {ids: $ids}, first: 100) {
    edges {
      node {
        ...RelatedProducts
      }
    }
  }
}
    ${UntypedRelatedProductsFragmentDoc}`;
export const UntypedShopDetailsDocument = gql`
    query ShopDetails {
  shop {
    name
    description
  }
}
    `;
export const UntypedFetchChannelsDocument = gql`
    query FetchChannels {
  channels {
    ...Channel
  }
}
    ${UntypedChannelFragmentDoc}`;
export const AttributeWithMappingFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AttributeWithMappingFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Attribute"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]} as unknown as DocumentNode<AttributeWithMappingFragmentFragment, unknown>;
export const BasicProductDataFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BasicProductData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pricing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"priceUndiscounted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantityAvailable"}}]}}]} as unknown as DocumentNode<BasicProductDataFragment, unknown>;
export const CategoryWithMappingFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CategoryWithMappingFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Category"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","alias":{"kind":"Name","value":"googleCategoryId"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"google_category_id","block":false}}]}]}}]} as unknown as DocumentNode<CategoryWithMappingFragmentFragment, unknown>;
export const GoogleFeedProductVariantFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GoogleFeedProductVariant"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pricing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"priceUndiscounted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantityAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"seoDescription"}},{"kind":"Field","name":{"kind":"Name","value":"productType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}}]}},{"kind":"Field","name":{"kind":"Name","value":"media"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"url"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"imageSize"}}}]},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"media"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"url"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"imageSize"}}}]},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"imageSize"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","alias":{"kind":"Name","value":"googleCategoryId"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"google_category_id","block":false}}]}]}}]}}]}}]} as unknown as DocumentNode<GoogleFeedProductVariantFragment, unknown>;
export const ProductAttributesFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductAttributes"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<ProductAttributesFragment, unknown>;
export const RelatedProductsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RelatedProducts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"seoDescription"}},{"kind":"Field","name":{"kind":"Name","value":"productType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}}]}},{"kind":"Field","name":{"kind":"Name","value":"media"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"url"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"imageSize"}}}]},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"media"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"url"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"imageSize"}}}]},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"imageSize"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","alias":{"kind":"Name","value":"googleCategoryId"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"google_category_id","block":false}}]}]}}]}}]} as unknown as DocumentNode<RelatedProductsFragment, unknown>;
export const WeightFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Weight"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Weight"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]} as unknown as DocumentNode<WeightFragment, unknown>;
export const ChannelFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]} as unknown as DocumentNode<ChannelFragment, unknown>;
export const DeleteAppMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAppMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keys"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletePrivateMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keys"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]} as unknown as DocumentNode<DeleteAppMetadataMutation, DeleteAppMetadataMutationVariables>;
export const UpdateAppMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAppMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePrivateMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdateAppMetadataMutation, UpdateAppMetadataMutationVariables>;
export const UpdateCategoryMappingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCategoryMapping"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"googleCategoryId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"google_category_id","block":false}},{"kind":"ObjectField","name":{"kind":"Name","value":"value"},"value":{"kind":"Variable","name":{"kind":"Name","value":"googleCategoryId"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateCategoryMappingMutation, UpdateCategoryMappingMutationVariables>;
export const FetchAppDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchAppDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"app"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<FetchAppDetailsQuery, FetchAppDetailsQueryVariables>;
export const FetchAttributesWithMappingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchAttributesWithMapping"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attributes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AttributeWithMappingFragment"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AttributeWithMappingFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Attribute"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]} as unknown as DocumentNode<FetchAttributesWithMappingQuery, FetchAttributesWithMappingQueryVariables>;
export const FetchProductVariantsDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchProductVariantsData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"channel"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productVariants"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"channel"},"value":{"kind":"Variable","name":{"kind":"Name","value":"channel"}}},{"kind":"Argument","name":{"kind":"Name","value":"sortBy"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"field"},"value":{"kind":"EnumValue","value":"LAST_MODIFIED_AT"}},{"kind":"ObjectField","name":{"kind":"Name","value":"direction"},"value":{"kind":"EnumValue","value":"ASC"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BasicProductData"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductAttributes"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BasicProductData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pricing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"priceUndiscounted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantityAvailable"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductAttributes"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<FetchProductVariantsDataQuery, FetchProductVariantsDataQueryVariables>;
export const FetchCategoriesWithMappingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchCategoriesWithMapping"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CategoryWithMappingFragment"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CategoryWithMappingFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Category"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","alias":{"kind":"Name","value":"googleCategoryId"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"google_category_id","block":false}}]}]}}]} as unknown as DocumentNode<FetchCategoriesWithMappingQuery, FetchCategoriesWithMappingQueryVariables>;
export const FetchProductCursorsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchProductCursors"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"channel"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productVariants"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"channel"},"value":{"kind":"Variable","name":{"kind":"Name","value":"channel"}}},{"kind":"Argument","name":{"kind":"Name","value":"sortBy"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"direction"},"value":{"kind":"EnumValue","value":"ASC"}},{"kind":"ObjectField","name":{"kind":"Name","value":"field"},"value":{"kind":"EnumValue","value":"LAST_MODIFIED_AT"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]}}]}}]} as unknown as DocumentNode<FetchProductCursorsQuery, FetchProductCursorsQueryVariables>;
export const FetchRelatedProductsDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchRelatedProductsData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"imageSize"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"1024"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RelatedProducts"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RelatedProducts"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"seoDescription"}},{"kind":"Field","name":{"kind":"Name","value":"productType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}}]}},{"kind":"Field","name":{"kind":"Name","value":"media"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"url"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"imageSize"}}}]},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"media"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"url"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"imageSize"}}}]},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"imageSize"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","alias":{"kind":"Name","value":"googleCategoryId"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"google_category_id","block":false}}]}]}}]}}]} as unknown as DocumentNode<FetchRelatedProductsDataQuery, FetchRelatedProductsDataQueryVariables>;
export const ShopDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ShopDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shop"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<ShopDetailsQuery, ShopDetailsQueryVariables>;
export const FetchChannelsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchChannels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]} as unknown as DocumentNode<FetchChannelsQuery, FetchChannelsQueryVariables>;