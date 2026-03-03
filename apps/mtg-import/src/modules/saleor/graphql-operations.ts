/**
 * Saleor GraphQL operations for the MTG Import app.
 *
 * Uses inline gql`` from urql (matching inventory-ops pattern).
 * Covers: product bulk create, channel queries, product type lookup, attribute queries.
 */

import { gql } from "urql";

// --- Queries ---

export const CHANNELS_QUERY = gql`
  query Channels {
    channels {
      id
      name
      slug
      currencyCode
    }
  }
`;

export const PRODUCT_TYPES_QUERY = gql`
  query ProductTypes($filter: ProductTypeFilterInput) {
    productTypes(first: 10, filter: $filter) {
      edges {
        node {
          id
          name
          slug
          productAttributes {
            id
            name
            slug
            inputType
          }
          variantAttributes {
            id
            name
            slug
            inputType
          }
        }
      }
    }
  }
`;

export const CATEGORIES_QUERY = gql`
  query Categories($filter: CategoryFilterInput) {
    categories(first: 10, filter: $filter) {
      edges {
        node {
          id
          name
          slug
        }
      }
    }
  }
`;

export const WAREHOUSES_QUERY = gql`
  query Warehouses {
    warehouses(first: 10) {
      edges {
        node {
          id
          name
          slug
        }
      }
    }
  }
`;

export const ATTRIBUTES_BY_SLUGS_QUERY = gql`
  query AttributesBySlugs($slugs: [String!]!) {
    attributes(first: 100, filter: { slugs: $slugs }) {
      edges {
        node {
          id
          slug
          name
          inputType
        }
      }
    }
  }
`;

export const PRODUCT_BY_SLUG_QUERY = gql`
  query ProductBySlug($slug: String!, $channel: String!) {
    product(slug: $slug, channel: $channel) {
      id
      name
      slug
    }
  }
`;

export const PRODUCT_METADATA_QUERY = gql`
  query ProductMetadata($id: ID!) {
    product(id: $id) {
      metadata {
        key
        value
      }
    }
  }
`;


export const PRODUCTS_BY_METADATA_QUERY = gql`
  query ProductsByMetadata($filter: ProductFilterInput!, $channel: String!, $first: Int!) {
    products(first: $first, filter: $filter, channel: $channel) {
      edges {
        node {
          id
          name
          slug
          attributes {
            attribute {
              id
              slug
            }
            values {
              name
              plainText
              boolean
              slug
            }
          }
          media {
            url
            alt
          }
          metadata {
            key
            value
          }
        }
      }
    }
  }
`;

export const PRODUCTS_WITH_VARIANTS_QUERY = gql`
  query ProductsWithVariants($filter: ProductFilterInput!, $channel: String!, $first: Int!, $after: String) {
    products(first: $first, filter: $filter, channel: $channel, after: $after) {
      edges {
        node {
          id
          name
          variants {
            id
            name
            attributes {
              attribute {
                id
                slug
              }
              values {
                name
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const PRODUCT_VARIANT_BULK_UPDATE_MUTATION = gql`
  mutation ProductVariantBulkUpdate($productId: ID!, $variants: [ProductVariantBulkUpdateInput!]!) {
    productVariantBulkUpdate(product: $productId, variants: $variants, errorPolicy: REJECT_FAILED_ROWS) {
      count
      results {
        errors {
          message
          code
          path
        }
      }
    }
  }
`;

// --- Mutations ---

export const PRODUCT_BULK_CREATE_MUTATION = gql`
  mutation ProductBulkCreate($products: [ProductBulkCreateInput!]!) {
    productBulkCreate(
      products: $products,
      errorPolicy: REJECT_FAILED_ROWS
    ) {
      count
      results {
        product {
          id
          name
          slug
          variants {
            id
            sku
            name
          }
        }
        errors {
          message
          code
          path
        }
      }
      errors {
        message
        code
        path
      }
    }
  }
`;

export const PRODUCT_UPDATE_MUTATION = gql`
  mutation ProductUpdate($id: ID!, $input: ProductInput!) {
    productUpdate(id: $id, input: $input) {
      product {
        id
        name
        slug
      }
      errors {
        message
        code
        field
      }
    }
  }
`;

export const ATTRIBUTE_BULK_CREATE_MUTATION = gql`
  mutation AttributeBulkCreate($attributes: [AttributeCreateInput!]!) {
    attributeBulkCreate(attributes: $attributes, errorPolicy: REJECT_FAILED_ROWS) {
      count
      results {
        attribute {
          id
          slug
          name
          inputType
        }
        errors {
          path
          message
          code
        }
      }
      errors {
        path
        message
        code
      }
    }
  }
`;

export const CHANNEL_CREATE_MUTATION = gql`
  mutation ChannelCreate($input: ChannelCreateInput!) {
    channelCreate(input: $input) {
      channel {
        id
        name
        slug
        currencyCode
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const PRODUCT_TYPE_CREATE_MUTATION = gql`
  mutation ProductTypeCreate($input: ProductTypeCreateInput!) {
    productTypeCreate(input: $input) {
      productType {
        id
        name
        slug
        productAttributes {
          id
          name
          slug
          inputType
        }
        variantAttributes {
          id
          name
          slug
          inputType
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const CATEGORY_CREATE_MUTATION = gql`
  mutation CategoryCreate($input: CategoryInput!) {
    categoryCreate(input: $input) {
      category {
        id
        name
        slug
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const WAREHOUSE_CREATE_MUTATION = gql`
  mutation WarehouseCreate($input: WarehouseCreateInput!) {
    warehouseCreate(input: $input) {
      warehouse {
        id
        name
        slug
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const PRODUCT_MEDIA_CREATE_MUTATION = gql`
  mutation ProductMediaCreate($input: ProductMediaCreateInput!) {
    productMediaCreate(input: $input) {
      media {
        id
        url
      }
      errors {
        message
        code
        field
      }
    }
  }
`;

export const PRODUCT_ATTRIBUTE_ASSIGN_MUTATION = gql`
  mutation ProductAttributeAssign(
    $productTypeId: ID!
    $operations: [ProductAttributeAssignInput!]!
  ) {
    productAttributeAssign(
      productTypeId: $productTypeId
      operations: $operations
    ) {
      productType {
        id
        slug
        productAttributes {
          id
          slug
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

// --- Types ---

export interface SaleorChannel {
  id: string;
  name: string;
  slug: string;
  currencyCode: string;
}

export interface SaleorProductType {
  id: string;
  name: string;
  slug: string;
  productAttributes: SaleorAttribute[];
  variantAttributes: SaleorAttribute[];
}

export interface SaleorAttribute {
  id: string;
  name: string;
  slug: string;
  inputType: string;
}

export interface SaleorCategory {
  id: string;
  name: string;
  slug: string;
}

export interface SaleorWarehouse {
  id: string;
  name: string;
  slug: string;
}

export interface ProductBulkCreateResult {
  count: number;
  results: Array<{
    product: {
      id: string;
      name: string;
      slug: string;
      variants: Array<{
        id: string;
        sku: string | null;
        name: string;
      }>;
    } | null;
    errors: Array<{
      message: string | null;
      code: string;
      path: string | null;
    }>;
  }>;
  errors: Array<{
    message: string | null;
    code: string;
    path: string | null;
  }>;
}

export interface ProductUpdateResult {
  product: {
    id: string;
    name: string;
    slug: string;
  } | null;
  errors: Array<{
    message: string | null;
    code: string;
    field: string | null;
  }>;
}

export interface AttributeBulkCreateResult {
  count: number;
  results: Array<{
    attribute: {
      id: string;
      slug: string;
      name: string;
      inputType: string;
    } | null;
    errors: Array<{
      path: string | null;
      message: string | null;
      code: string;
    }>;
  }>;
  errors: Array<{
    path: string | null;
    message: string | null;
    code: string;
  }>;
}

export interface ProductAttributeAssignResult {
  productType: {
    id: string;
    slug: string;
    productAttributes: Array<{
      id: string;
      slug: string;
    }>;
  } | null;
  errors: Array<{
    field: string | null;
    message: string | null;
    code: string;
  }>;
}

export interface ProductMediaCreateResult {
  media: {
    id: string;
    url: string;
  } | null;
  errors: Array<{
    message: string | null;
    code: string;
    field: string | null;
  }>;
}

export interface VariantBulkUpdateResult {
  count: number;
  results: Array<{
    errors: Array<{
      message: string | null;
      code: string;
      path: string | null;
    }>;
  }>;
}

export interface SaleorProductWithVariants {
  id: string;
  name: string;
  variants: Array<{
    id: string;
    name: string;
    attributes: Array<{
      attribute: { id: string; slug: string };
      values: Array<{ name: string | null }>;
    }>;
  }>;
}

export interface SaleorProductWithAttributes {
  id: string;
  name: string;
  slug: string;
  attributes: Array<{
    attribute: { id: string; slug: string };
    values: Array<{
      name: string | null;
      plainText: string | null;
      boolean: boolean | null;
      slug: string | null;
    }>;
  }>;
  media: Array<{ url: string; alt: string | null }>;
  metadata: Array<{ key: string; value: string }>;
}
