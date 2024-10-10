import { ResultOf } from "gql.tada";

import { CalculateTaxesEventFragment } from "../../../../graphql/fragments/CalculateTaxesEvent";

/**
 * Common subset for ORDER and CHECKOUT events
 */
export type CalculateTaxesPayload = Extract<
  ResultOf<typeof CalculateTaxesEventFragment>,
  { __typename: "CalculateTaxes" }
>;
