import { gql } from "urql";

export const CREATE_PRODUCT_TYPE_MUTATION = gql`
  mutation CreateProductType($input: ProductTypeInput!) {
    productTypeCreate(input: $input) {
      productType {
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

export const CREATE_ATTRIBUTE_MUTATION = gql`
  mutation CreateAttribute($input: AttributeCreateInput!) {
    attributeCreate(input: $input) {
      attribute {
        id
        name
        slug
        inputType
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const CREATE_ATTRIBUTE_VALUE_MUTATION = gql`
  mutation CreateAttributeValue($attributeId: ID!, $input: AttributeValueCreateInput!) {
    attributeValueCreate(attribute: $attributeId, input: $input) {
      attributeValue {
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

export const CREATE_CATEGORY_MUTATION = gql`
  mutation CreateCategory($input: CategoryInput!) {
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

export const CREATE_COLLECTION_MUTATION = gql`
  mutation CreateCollection($input: CollectionCreateInput!) {
    collectionCreate(input: $input) {
      collection {
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

export const ADD_PRODUCTS_TO_COLLECTION_MUTATION = gql`
  mutation AddProductsToCollection($collectionId: ID!, $products: [ID!]!) {
    collectionAddProducts(collectionId: $collectionId, products: $products) {
      collection {
        id
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($input: ProductCreateInput!) {
    productCreate(input: $input) {
      product {
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

export const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    productUpdate(id: $id, input: $input) {
      product {
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

export const CREATE_PRODUCT_VARIANT_MUTATION = gql`
  mutation CreateProductVariant($input: ProductVariantCreateInput!) {
    productVariantCreate(input: $input) {
      productVariant {
        id
        name
        sku
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const UPDATE_PRODUCT_VARIANT_MUTATION = gql`
  mutation UpdateProductVariant($id: ID!, $input: ProductVariantInput!) {
    productVariantUpdate(id: $id, input: $input) {
      productVariant {
        id
        name
        sku
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const UPDATE_PRODUCT_VARIANT_STOCKS_MUTATION = gql`
  mutation UpdateProductVariantStocks($variantId: ID!, $stocks: [StockInput!]!) {
    productVariantStocksUpdate(variantId: $variantId, stocks: $stocks) {
      productVariant {
        id
        stocks {
          warehouse {
            id
          }
          quantity
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

export const PRODUCT_CHANNEL_LISTING_UPDATE_MUTATION = gql`
  mutation ProductChannelListingUpdate($id: ID!, $input: ProductChannelListingUpdateInput!) {
    productChannelListingUpdate(id: $id, input: $input) {
      product {
        id
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const PRODUCT_VARIANT_CHANNEL_LISTING_UPDATE_MUTATION = gql`
  mutation ProductVariantChannelListingUpdate($id: ID!, $input: [ProductVariantChannelListingAddInput!]!) {
    productVariantChannelListingUpdate(id: $id, input: $input) {
      variant {
        id
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
        field
        message
        code
      }
    }
  }
`;

export const UPDATE_METADATA_MUTATION = gql`
  mutation UpdateMetadata($id: ID!, $input: [MetadataInput!]!) {
    updateMetadata(id: $id, input: $input) {
      item {
        ... on Product {
          id
          metadata {
            key
            value
          }
        }
        ... on ProductVariant {
          id
          metadata {
            key
            value
          }
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
