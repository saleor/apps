import { describe, expect, it } from "vitest";

import { enrichPayloadWithConfig } from "./enrich-payload-with-config";

describe("enrichPayloadWithConfig", () => {
  it("adds customVariables when the config has variables", () => {
    const result = enrichPayloadWithConfig(
      { order: { number: 1 } },
      { customVariables: { storefrontUrl: "https://shop.example" } },
    );

    expect(result).toStrictEqual({
      order: { number: 1 },
      customVariables: { storefrontUrl: "https://shop.example" },
    });
  });

  it("does not add customVariables when the config has none", () => {
    const result = enrichPayloadWithConfig({ order: { number: 1 } }, { customVariables: {} });

    expect(result).toStrictEqual({ order: { number: 1 } });
    expect(result).not.toHaveProperty("customVariables");
  });

  it("adds branding when configured", () => {
    const result = enrichPayloadWithConfig(
      { order: {} },
      { brandingSiteName: "My store", brandingLogoUrl: "https://shop.example/logo.png" },
    );

    expect(result).toStrictEqual({
      order: {},
      branding: { siteName: "My store", logoUrl: "https://shop.example/logo.png" },
    });
  });

  it("does not add branding when not configured", () => {
    const result = enrichPayloadWithConfig({ order: {} }, {});

    expect(result).toStrictEqual({ order: {} });
    expect(result).not.toHaveProperty("branding");
  });

  it("replaces (does not deep-merge) branding and customVariables already present in the payload", () => {
    const result = enrichPayloadWithConfig(
      {
        order: {},
        customVariables: { stale: "value" },
        branding: { siteName: "stale", logoUrl: "stale" },
      },
      {
        brandingSiteName: "Real store",
        customVariables: { storefrontUrl: "https://real.example" },
      },
    );

    expect(result).toStrictEqual({
      order: {},
      customVariables: { storefrontUrl: "https://real.example" },
      branding: { siteName: "Real store", logoUrl: null },
    });
  });

  it("returns an object even when the payload is not an object", () => {
    expect(enrichPayloadWithConfig(null, { customVariables: { a: "b" } })).toStrictEqual({
      customVariables: { a: "b" },
    });
    expect(enrichPayloadWithConfig("string", {})).toStrictEqual({});
    expect(enrichPayloadWithConfig([1, 2], {})).toStrictEqual({});
  });
});
