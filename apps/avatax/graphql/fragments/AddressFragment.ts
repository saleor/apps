import { graphql, ResultOf } from "@/graphql";

export const AddressFragment = graphql(`
  fragment Address on Address {
    streetAddress1
    streetAddress2
    city
    countryArea
    postalCode
    country {
      code
    }
  }
`);

export type AddressFragmentType = ResultOf<typeof AddressFragment>;
