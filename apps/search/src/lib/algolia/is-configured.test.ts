import { describe, expect, it } from "vitest";
import { isConfigured } from "./is-configured";

describe("isConfigured", () => {
  describe("Valid configurations", () => {
    it("Returns true, when configuration has all fields filled", () => {
      expect(
        isConfigured({
          configuration: { appId: "appId", indexNamePrefix: "prefix", secretKey: "secretKey" },
        }),
      ).toBe(true);
    });
    it("Returns true, when optional index name is not set", () => {
      expect(
        isConfigured({
          configuration: {
            appId: "appId",
            indexNamePrefix: undefined,
            secretKey: "secretKey",
          },
        }),
      ).toBe(true);
    });
  });
  describe("Invalid configurations", () => {
    it("Returns false, when empty configuration is used", () => {
      expect(isConfigured({ configuration: undefined })).toBe(false);
    });

    it("Returns false, when app id is missing", () => {
      expect(
        isConfigured({
          configuration: { appId: undefined, indexNamePrefix: "prefix", secretKey: "secretKey" },
        }),
      ).toBe(false);
    });

    it("Returns false, when app id is missing", () => {
      expect(
        isConfigured({
          configuration: { appId: "appId", indexNamePrefix: "prefix", secretKey: undefined },
        }),
      ).toBe(false);
    });
  });
});
