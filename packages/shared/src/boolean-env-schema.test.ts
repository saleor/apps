import { describe, expect, it } from "vitest";

import { booleanEnv } from "./boolean-env-schema";

describe("booleanEnv", () => {
  describe("noDefault", () => {
    it("parses 'true' string to true boolean", () => {
      expect(booleanEnv.noDefault.parse("true")).toBe(true);
    });

    it("parses 'false' string to false boolean", () => {
      expect(booleanEnv.noDefault.parse("false")).toBe(false);
    });

    it("throws on invalid string value", () => {
      expect(() => booleanEnv.noDefault.parse("yes")).toThrow();
      expect(() => booleanEnv.noDefault.parse("1")).toThrow();
      expect(() => booleanEnv.noDefault.parse("")).toThrow();
    });

    it("throws on non-string value", () => {
      expect(() => booleanEnv.noDefault.parse(true)).toThrow();
      expect(() => booleanEnv.noDefault.parse(1)).toThrow();
      expect(() => booleanEnv.noDefault.parse(undefined)).toThrow();
    });
  });

  describe("defaultTrue", () => {
    it("returns true when value is undefined", () => {
      expect(booleanEnv.defaultTrue.parse(undefined)).toBe(true);
    });

    it("parses 'false' string to false boolean", () => {
      expect(booleanEnv.defaultTrue.parse("false")).toBe(false);
    });

    it("parses 'true' string to true boolean", () => {
      expect(booleanEnv.defaultTrue.parse("true")).toBe(true);
    });
  });

  describe("defaultFalse", () => {
    it("returns false when value is undefined", () => {
      expect(booleanEnv.defaultFalse.parse(undefined)).toBe(false);
    });

    it("parses 'true' string to true boolean", () => {
      expect(booleanEnv.defaultFalse.parse("true")).toBe(true);
    });

    it("parses 'false' string to false boolean", () => {
      expect(booleanEnv.defaultFalse.parse("false")).toBe(false);
    });
  });
});
