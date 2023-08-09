import { describe, expect, it } from "vitest";
import { OrderConfirmedSubscriptionFragment } from "../../../generated/graphql";
import { AvataxCalculationDateResolver } from "./avatax-calculation-date-resolver";

const resolver = new AvataxCalculationDateResolver();

describe("AvataxCalculationDateResolver", () => {
  it("should return the metadata tax calculation date if it is set", () => {
    const order = {
      avataxTaxCalculationDate: "2021-01-01T00:00:00.000Z",
      created: "2021-01-02T00:00:00.000Z",
    } as any as OrderConfirmedSubscriptionFragment;

    expect(resolver.resolve(order.avataxTaxCalculationDate, order.created)).toEqual(
      new Date("2021-01-01T00:00:00.000Z")
    );
  });
  it("should fallback to order created when metadata tax calculation date is not a string datetime", () => {
    const order = {
      avataxTaxCalculationDate: "not-a-datetime",
      created: "2021-01-02T00:00:00.000Z",
    } as any as OrderConfirmedSubscriptionFragment;

    expect(resolver.resolve(order.avataxTaxCalculationDate, order.created)).toEqual(
      new Date("2021-01-02T00:00:00.000Z")
    );
  });
  it("should return the order creation date if the metadata tax calculation date is not set", () => {
    const order = {
      created: "2021-01-02T00:00:00.000Z",
    } as any as OrderConfirmedSubscriptionFragment;

    expect(resolver.resolve(order.avataxTaxCalculationDate, order.created)).toEqual(
      new Date("2021-01-02T00:00:00.000Z")
    );
  });
});
