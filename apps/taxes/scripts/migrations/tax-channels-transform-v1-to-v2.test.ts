import { dummyChannelsV1Config } from "./run-generate-dummy-data";
import { TaxChannelsTransformV1toV2 } from "./tax-channels-transform-v1-to-v2";
import { describe, expect, it } from "vitest";

const transformer = new TaxChannelsTransformV1toV2();

describe("TaxChannelsTransformV1toV2", () => {
  it("should transform v1 to v2", () => {
    const result = transformer.transform(dummyChannelsV1Config);

    expect(result).toEqual([
      {
        id: expect.any(String),
        config: {
          providerConnectionId: "24822834-1a49-4b51-8a59-579affdb772f",
          slug: "default-channel",
        },
      },
      {
        id: expect.any(String),
        config: {
          providerConnectionId: "d15d9907-a3cb-42d2-9336-366d2366e91b",
          slug: "channel-pln",
        },
      },
    ]);
  });

  it("should return empty array if no channels are provided", () => {
    const result = transformer.transform({});

    expect(result).toEqual([]);
  });
});
