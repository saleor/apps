import { Obfuscator } from "./obfuscator";
import { describe, expect, it } from "vitest";
const obfuscator = new Obfuscator();

describe("Obfuscator", () => {
  describe("obfuscate", () => {
    it("obfuscates all but the last 4 characters of a string", () => {
      expect(obfuscator.obfuscate("1234567890")).toBe("******7890");
    });
    it("returns asterisks even if the string is shorter than 4 characters", () => {
      expect(obfuscator.obfuscate("123")).toBe("***");
    });
  });
  describe("isObfuscated", () => {
    it("returns true if the string contains 4 asterisks", () => {
      expect(obfuscator.isObfuscated("1234****")).toBe(true);
    });
    it("returns false if the string does not contain 4 asterisks", () => {
      expect(obfuscator.isObfuscated("1234567890")).toBe(false);
    });
  });
});
