import { describe, expect, it } from "vitest";

import { AlgoliaErrorParser } from "./algolia-error-parser";

describe("AlgoliaErrorParser", () => {
  describe("isAuthError", () => {
    it("Returns false if cant parse", () => {
      expect(
        AlgoliaErrorParser.isAuthError({
          foo: "bar",
        }),
      ).toBe(false);
    });

    it("Returns true if 401 or 403 status attached to error", () => {
      expect(
        AlgoliaErrorParser.isAuthError({
          status: 401,
          message: "Error message",
        }),
      ).toBe(true);

      expect(
        AlgoliaErrorParser.isAuthError({
          status: 403,
          message: "Error message",
        }),
      ).toBe(true);
    });

    it.each([200, 400, 500])("Returns false for status: %s", (statusCode) => {
      expect(
        AlgoliaErrorParser.isAuthError({
          status: statusCode,
          message: "Error message",
        }),
      ).toBe(false);
    });
  });

  describe("isRecordSizeTooBigError", () => {
    it("Returns false if cant parse", () => {
      expect(
        AlgoliaErrorParser.isRecordSizeTooBigError({
          unknownField: "unknownValue",
        }),
      ).toBe(false);
    });

    it("Returns true if Algolia returns record too big error", () => {
      expect(
        AlgoliaErrorParser.isRecordSizeTooBigError({
          status: 400,
          message: "Record at the position 0 objectID=U123zg3 is too big size=12000/10000 bytes.",
        }),
      ).toBe(true);
    });

    it.each([200, 400, 500])("Returns false for status: %s", (statusCode) => {
      expect(
        AlgoliaErrorParser.isAuthError({
          status: statusCode,
          message: "Error message",
        }),
      ).toBe(false);
    });
  });
});
