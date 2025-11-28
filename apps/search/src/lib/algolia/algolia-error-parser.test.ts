import { describe, expect, it } from "vitest";

import { AlgoliaErrorParser, createRecordSizeErrorMessage } from "./algolia-error-parser";

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

  describe("parseRecordSizeError", () => {
    it("Returns null if cant parse", () => {
      expect(
        AlgoliaErrorParser.parseRecordSizeError({
          unknownField: "unknownValue",
        }),
      ).toBe(null);
    });

    it("Returns null if message format is unexpected", () => {
      expect(
        AlgoliaErrorParser.parseRecordSizeError({
          status: 400,
          message: "Some other error message",
        }),
      ).toBe(null);
    });

    it("Parses record size error details correctly", () => {
      const result = AlgoliaErrorParser.parseRecordSizeError({
        status: 400,
        message:
          "Record at the position 0 objectID=ProductId_VariantId is too big size=15000/10000 bytes",
      });

      expect(result).toStrictEqual({
        objectId: "ProductId_VariantId",
        actualSize: 15000,
        maxSize: 10000,
        rawMessage:
          "Record at the position 0 objectID=ProductId_VariantId is too big size=15000/10000 bytes",
      });
    });
  });

  describe("getErrorMessage", () => {
    it("Returns 'Unknown error' if cant parse", () => {
      expect(
        AlgoliaErrorParser.getErrorMessage({
          unknownField: "unknownValue",
        }),
      ).toBe("Unknown error");
    });

    it("Returns message from parsed error", () => {
      expect(
        AlgoliaErrorParser.getErrorMessage({
          status: 400,
          message: "Some error message",
        }),
      ).toBe("Some error message");
    });
  });
});

describe("createRecordSizeErrorMessage", () => {
  it("Creates message with size details when provided", () => {
    const message = createRecordSizeErrorMessage(
      {
        objectId: "ProductId_VariantId",
        actualSize: 15000,
        maxSize: 10000,
        rawMessage: "raw",
      },
      { productId: "prod123", variantId: "var456" },
    );

    expect(message).toContain("Product variant var456 exceeds Algolia's record size limit");
    expect(message).toContain("Current size: 15000 bytes, limit: 10000 bytes");
    expect(message).toContain("Algolia fields filtering");
    expect(message).toContain("algoliaDescription");
  });

  it("Creates message without size details when not provided", () => {
    const message = createRecordSizeErrorMessage(null, { productId: "prod123" });

    expect(message).toContain("Product prod123 exceeds Algolia's record size limit");
    expect(message).toContain("Record exceeds Algolia size limit");
  });

  it("Uses generic product info when no IDs provided", () => {
    const message = createRecordSizeErrorMessage(null, {});

    expect(message).toContain("Product exceeds Algolia's record size limit");
  });

  it("Includes documentation link", () => {
    const message = createRecordSizeErrorMessage(null, {});

    expect(message).toContain("https://docs.saleor.io/developer/app-store/apps/search");
  });

  it("Includes actionable steps", () => {
    const message = createRecordSizeErrorMessage(null, {});

    expect(message).toContain("To fix this issue:");
    expect(message).toContain("description");
    expect(message).toContain("metadata");
    expect(message).toContain("media");
  });
});
