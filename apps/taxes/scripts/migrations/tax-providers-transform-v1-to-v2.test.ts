import { dummyChannelsV1Config, dummyTaxProvidersV1Config } from "./run-generate-dummy-data";
import { TaxProvidersV1ToV2Transformer } from "./tax-providers-transform-v1-to-v2";
import { describe, expect, it } from "vitest";

const transformer = new TaxProvidersV1ToV2Transformer();

describe("TaxProvidersV1ToV2Transformer", () => {
  it("should transform v1 to v2", () => {
    const result = transformer.transform(dummyTaxProvidersV1Config, dummyChannelsV1Config);

    expect(result).toEqual([
      {
        id: "24822834-1a49-4b51-8a59-579affdb772f",
        provider: "avatax",
        config: {
          name: "Avatalara1",
          isSandbox: true,
          isAutocommit: true,
          credentials: {
            username: "username",
            password: "password",
          },
          companyCode: "companyCode",
          shippingTaxCode: "shippingTaxCode",
          address: {
            city: "San Francisco",
            country: "US",
            state: "CA",
            street: "Sesame Street",
            zip: "10001",
          },
        },
      },
      {
        id: "d15d9907-a3cb-42d2-9336-366d2366e91b",
        provider: "taxjar",
        config: {
          name: "TaxJar1",
          isSandbox: true,
          credentials: {
            apiKey: "apiKey",
          },
          address: {
            city: "San Francisco",
            country: "US",
            state: "CA",
            street: "Sesame Street",
            zip: "10001",
          },
        },
      },
    ]);
  });

  it("should return empty array if no channels and providers are provided", () => {
    const result = transformer.transform([], {});

    expect(result).toEqual([]);
  });
});
