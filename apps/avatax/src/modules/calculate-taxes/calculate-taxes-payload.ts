import { CalculateTaxesEventFragment } from "../../../generated/graphql";

/**
 * Common subset for ORDER and CHECKOUT events
 */
export type ICalculateTaxesPayload = Extract<
  CalculateTaxesEventFragment,
  { __typename: "CalculateTaxes" }
>;

// TODO: Add validation methods, call them in controller
export class CalculateTaxesPayload {
  constructor(public rawPayload: ICalculateTaxesPayload) {}
}
