import { gql } from "urql";

export const GET_PRODUCTS_QUERY = gql`
  query GetProducts($first: Int!, $after: String, $channel: String!) {
    products(first: $first, after: $after, channel: $channel) {
      edges {
        cursor
        node {
          id
          name
          slug
          description
          productType {
            id
            name
          }
          category {
            id
            name
            slug
          }
          collections {
            id
            name
            slug
          }
          attributes {
            attribute {
              id
              name
              slug
              inputType
            }
            values {
              id
              name
              slug
              value
            }
          }
          metadata {
            key
            value
          }
          variants {
            id
            name
            sku
            metadata {
              key
              value
            }
            attributes {
              attribute {
                id
                name
                slug
              }
              values {
                id
                name
                slug
                value
              }
            }
            pricing(address: { country: US }) {
              price {
                gross {
                  amount
                  currency
                }
              }
            }
            stocks {
              warehouse {
                id
                name
              }
              quantity
            }
            media {
              id
              url
              alt
            }
            weight {
              value
              unit
            }
          }
          media {
            id
            url
            alt
            type
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_PRODUCT_TYPES_QUERY = gql`
  query GetProductTypes($first: Int!) {
    productTypes(first: $first) {
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
            choices(first: 100) {
              edges {
                node {
                  id
                  name
                  slug
                }
              }
            }
          }
          variantAttributes {
            id
            name
            slug
            inputType
            choices(first: 100) {
              edges {
                node {
                  id
                  name
                  slug
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_CATEGORIES_QUERY = gql`
  query GetCategories($first: Int!) {
    categories(first: $first) {
      edges {
        node {
          id
          name
          slug
          parent {
            id
            name
          }
        }
      }
    }
  }
`;

export const GET_COLLECTIONS_QUERY = gql`
  query GetCollections($first: Int!, $channel: String!) {
    collections(first: $first, channel: $channel) {
      edges {
        node {
          id
          name
          slug
          description
        }
      }
    }
  }
`;

export const GET_CHANNELS_QUERY = gql`
  query GetChannels {
    channels {
      id
      name
      slug
      currencyCode
      isActive
    }
  }
`;

export const GET_WAREHOUSES_QUERY = gql`
  query GetWarehouses($first: Int!) {
    warehouses(first: $first) {
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

export const GET_ATTRIBUTES_QUERY = gql`
  query GetAttributes($first: Int!) {
    attributes(first: $first) {
      edges {
        node {
          id
          name
          slug
          inputType
          type
          choices(first: 100) {
            edges {
              node {
                id
                name
                slug
              }
            }
          }
        }
      }
    }
  }
`;
