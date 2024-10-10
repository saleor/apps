import { graphql } from "@/graphql";

export const TaxBaseOrderLineFragment = graphql(`
  fragment TaxBaseOrderLine on OrderLine {
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
