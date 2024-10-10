import { graphql } from "@/graphql";

export const OrderLineFragment = graphql(`
  fragment OrderLine on OrderLine {
    id
    orderProductVariant: variant {
      id
      product {
        taxClass {
          id
          name
        }
      }
    }
  }
`);
