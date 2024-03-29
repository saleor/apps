import { CalculateTaxesEventFragment } from "../../../generated/graphql";

/**
 * Common subset for ORDER and CHECKOUT events
 */
export type ICalculateTaxesPayload = Extract<
  CalculateTaxesEventFragment,
  { __typename: "CalculateTaxes" }
>;

/*
 * TODO: Add validation methods, call them in controller
 * TODO Extract interface?
 */
export class CalculateTaxesPayload {
  constructor(public rawPayload: ICalculateTaxesPayload) {}

  getPrivateMetadataItems() {
    return this.rawPayload.recipient?.privateMetadata ?? [];
  }

  getChannelSlug() {
    return this.rawPayload.taxBase.channel.slug;
  }
}
