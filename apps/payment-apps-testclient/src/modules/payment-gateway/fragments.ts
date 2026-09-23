import { graphql } from "@/graphql/gql";

export const TotalPriceFragment = graphql(`
  fragment TotalPrice on TaxedMoney {
    gross {
      amount
    }
  }
`);

export const PaymentGatewayFragment = graphql(`
  fragment PaymentGateway on PaymentGateway {
    id
    name
  }
`);
