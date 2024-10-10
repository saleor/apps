import { graphql, ResultOf } from "@/graphql";

export const TaxDiscountFragment = graphql(`
  fragment TaxDiscount on TaxableObjectDiscount {
    amount {
      amount
    }
    type
  }
`);

export type TaxDiscountFragment = ResultOf<typeof TaxDiscountFragment>;
