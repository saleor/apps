import { graphql } from "@/graphql/gql";

export const ProductFragment = graphql(`
  fragment Product on Product {
    id
    name
    thumbnail(size: 2048) {
      url
    }
    category {
      name
    }
    defaultVariant {
      id
      pricing {
        price {
          gross {
            amount
            currency
          }
        }
      }
    }
  }
`);
