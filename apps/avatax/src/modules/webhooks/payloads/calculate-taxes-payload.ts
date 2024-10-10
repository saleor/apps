import { ResultOf } from "gql.tada";

import { CalculateTaxesSubscription } from "../../../../graphql/subscriptions/CalculateTaxes";

/**
 * Common subset for ORDER and CHECKOUT events
 */
export type CalculateTaxesPayload = Extract<
  ResultOf<typeof CalculateTaxesSubscription>,
  { __typename: "CalculateTaxes" }
>;
