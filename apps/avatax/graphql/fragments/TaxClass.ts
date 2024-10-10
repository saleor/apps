import { graphql } from "@/graphql";

export const TaxClassFragment = graphql(`
  fragment TaxClass on TaxClass {
    id
    name
  }
`);
