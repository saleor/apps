import { CalculateTaxesEventFragment } from "../../../../generated/graphql";

/**
 * Common subset for ORDER and CHECKOUT events
 */
/**
 * @deprecated use `SaleorCalculateTaxesEvent` instead - fix it
 */
export type CalculateTaxesPayload = Extract<
  CalculateTaxesEventFragment,
  { __typename: "CalculateTaxes" }
>;
