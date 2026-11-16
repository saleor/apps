import { graphql } from "@/graphql/gql";

export const ProductFragment = graphql(`
  fragment Product on Product {
    id
    name
    thumbnail(size: 256) {
      url
    }
    category {
      name
    }
    variants {
      id
      name
      quantityAvailable
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
