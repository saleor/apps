import { CalculateTaxesEventFragment } from "../../../../generated/graphql";

/**
 * Common subset for ORDER and CHECKOUT events
 */
export type CalculateTaxesPayload = Extract<
  CalculateTaxesEventFragment,
  { __typename: "CalculateTaxes" }
>;
