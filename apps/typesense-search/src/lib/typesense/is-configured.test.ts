import { describe, expect, it } from "vitest";
import { isConfigured } from "./is-configured";

describe("isConfigured", () => {
  describe("Valid configurations", () => {
    it("Returns true, when configuration has all fields filled", () => {
      expect(
        isConfigured({
          configuration: {
            host: "host",
            protocol: "protocol",
            apiKey: "apiKey",
            port: 8080,
            connectionTimeoutSeconds: 10,
          },
        }),
      ).toBe(true);
    });
    it("Returns true, when optional host is not set", () => {
      expect(
        isConfigured({
          configuration: {
            host: undefined,
            protocol: "protocol",
            apiKey: "apiKey",
            port: 8080,
            connectionTimeoutSeconds: 10,
          },
        }),
      ).toBe(true);
    });
  });
  describe("Invalid configurations", () => {
    it("Returns false, when empty configuration is used", () => {
      expect(isConfigured({ configuration: undefined })).toBe(false);
    });
    it("Returns false, when host is not set", () => {
      expect(
        isConfigured({
          configuration: {
            host: "",
            protocol: "protocol",
            apiKey: "apiKey",
            port: 8080,
            connectionTimeoutSeconds: 10,
          },
        }),
      ).toBe(false);
    });
    it("Returns false, when protocol is not set", () => {
      expect(
        isConfigured({
          configuration: {
            host: "host",
            protocol: "",
            apiKey: "apiKey",
            port: 8080,
            connectionTimeoutSeconds: 10,
          },
        }),
      ).toBe(false);
    });
    it("Returns false, when apiKey is not set", () => {
      expect(
        isConfigured({
          configuration: {
            host: "host",
            protocol: "protocol",
            apiKey: "",
            port: 8080,
            connectionTimeoutSeconds: 10,
          },
        }),
      ).toBe(false);
    });
    it("Returns false, when port is not set", () => {
      expect(
        isConfigured({
          configuration: {
            host: "host",
            protocol: "protocol",
            apiKey: "apiKey",
            port: undefined,
            connectionTimeoutSeconds: 10,
          },
        }),
      ).toBe(false);
    });
    it("Returns false, when connectionTimeoutSeconds is not set", () => {
      expect(
        isConfigured({
          configuration: {
            host: "host",
            protocol: "protocol",
            apiKey: "apiKey",
            port: 8080,
            connectionTimeoutSeconds: undefined,
          },
        }),
      ).toBe(false);
    });
  });
});
