import { graphql } from "@/graphql/gql";

export const TotalPriceFragment = graphql(`
  fragment TotalPrice on TaxedMoney {
    gross {
      amount
      currency
    }
  }
`);
