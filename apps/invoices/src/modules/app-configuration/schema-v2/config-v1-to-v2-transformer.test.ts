import { describe, expect, it } from "vitest";
import { ConfigV1ToV2Transformer } from "./config-v1-to-v2-transformer";
import { getMockAddress } from "../../../fixtures/mock-address";

describe("ConfigV1ToV2Transformer", function () {
  it("Returns empty V2 instance if config is null", () => {
    // @ts-expect-error
    const v2 = new ConfigV1ToV2Transformer().transform(null);

    expect(v2.serialize()).toMatchInlineSnapshot(`"{"channelsOverrides":{}}"`);
  });

  it("Maps V1 address overrides to V2 - single channel override", () => {
    const v2 = new ConfigV1ToV2Transformer().transform({
      shopConfigPerChannel: {
        "default-channel": {
          address: getMockAddress(),
        },
      },
    });

    expect(v2.getChannelsOverrides()).toEqual(
      expect.objectContaining({
        "default-channel": getMockAddress(),
      }),
    );
  });

  it("Maps V1 address overrides to V2 - multiple channels override", () => {
    const v2 = new ConfigV1ToV2Transformer().transform({
      shopConfigPerChannel: {
        "default-channel": {
          address: getMockAddress(),
        },
        "custom-channel": {
          address: getMockAddress(),
        },
      },
    });

    expect(v2.getChannelsOverrides()).toEqual(
      expect.objectContaining({
        "default-channel": getMockAddress(),
        "custom-channel": getMockAddress(),
      }),
    );
  });

  it("Falls back to empty string for address property if not set", () => {
    const addressMock = getMockAddress();

    // @ts-expect-error
    delete addressMock.city;

    const v2 = new ConfigV1ToV2Transformer().transform({
      shopConfigPerChannel: {
        "default-channel": {
          address: addressMock,
        },
      },
    });

    expect(v2.getChannelsOverrides()).toEqual(
      expect.objectContaining({
        "default-channel": {
          ...getMockAddress(),
          city: "",
        },
      }),
    );
  });
});
