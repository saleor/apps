import { describe, it, expect } from "vitest";
import { appConfigInputSchema } from "./app-config-input-schema";
import { AppConfigV1, SellerShopConfig } from "./app-config-v1";
import { getMockAddress } from "../../../fixtures/mock-address";

describe("appConfigInputSchema", () => {
  it("Passes with no channels at all", () => {
    expect(() =>
      appConfigInputSchema.parse({
        shopConfigPerChannel: {},
      } satisfies AppConfigV1)
    ).not.to.throw();
  });

  it("Passes with all address fields empty", () => {
    expect(() =>
      appConfigInputSchema.parse({
        shopConfigPerChannel: {
          channel: {
            address: {
              city: "",
              cityArea: "",
              companyName: "",
              country: "",
              countryArea: "",
              postalCode: "",
              streetAddress1: "",
              streetAddress2: "",
            },
          },
        },
      } satisfies AppConfigV1)
    ).not.to.throw();
  });

  it("Passes with partial address", () => {
    expect(() =>
      appConfigInputSchema.parse({
        shopConfigPerChannel: {
          channel: {
            address: getMockAddress(),
          },
        },
      } satisfies AppConfigV1)
    ).not.to.throw();
  });
});
