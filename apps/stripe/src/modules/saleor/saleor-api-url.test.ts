import { describe, expect, it } from "vitest";

import { createSaleorApiUrl, SaleorApiUrlValidationError } from "./saleor-api-url";

describe("SaleorApiUrl", () => {
  describe("create", () => {
    it("should create valid URL with https", () => {
      const result = createSaleorApiUrl("https://demo.saleor.io/graphql/");

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBe("https://demo.saleor.io/graphql/");
    });

    it("should create valid URL with http", () => {
      const result = createSaleorApiUrl("http://demo.saleor.io/graphql/");

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBe("http://demo.saleor.io/graphql/");
    });

    it("should reject empty URL", () => {
      const result = createSaleorApiUrl("");

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(SaleorApiUrlValidationError);
      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        [SaleorApiUrlValidationError: ZodError: [
          {
            "validation": "url",
            "code": "invalid_string",
            "message": "Invalid url",
            "path": []
          },
          {
            "code": "invalid_string",
            "validation": {
              "endsWith": "/graphql/"
            },
            "message": "Invalid input: must end with \\"/graphql/\\"",
            "path": []
          },
          {
            "code": "custom",
            "message": "Invalid input: must start with \\"http://\\" or \\"https://\\"",
            "path": []
          }
        ]]
      `);
    });

    it("should reject URL not starting with http/https", () => {
      const result = createSaleorApiUrl("ftp://demo.saleor.io/graphql/");

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(SaleorApiUrlValidationError);
      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        [SaleorApiUrlValidationError: ZodError: [
          {
            "code": "custom",
            "message": "Invalid input: must start with \\"http://\\" or \\"https://\\"",
            "path": []
          }
        ]]
      `);
    });

    it("should reject URL not ending with /graphql/", () => {
      const result = createSaleorApiUrl("https://demo.saleor.io/");

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(SaleorApiUrlValidationError);
      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        [SaleorApiUrlValidationError: ZodError: [
          {
            "code": "invalid_string",
            "validation": {
              "endsWith": "/graphql/"
            },
            "message": "Invalid input: must end with \\"/graphql/\\"",
            "path": []
          }
        ]]
      `);
    });

    it("should reject incorrect URL", () => {
      const result = createSaleorApiUrl("demo.saleor.io/graphql/");

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(SaleorApiUrlValidationError);
      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        [SaleorApiUrlValidationError: ZodError: [
          {
            "validation": "url",
            "code": "invalid_string",
            "message": "Invalid url",
            "path": []
          },
          {
            "code": "custom",
            "message": "Invalid input: must start with \\"http://\\" or \\"https://\\"",
            "path": []
          }
        ]]
      `);
    });

    it("shouldn't be assignable without createSaleorApiUrl", () => {
      // @ts-expect-error - if this fails - it means the type is not branded
      const testValue: SaleorApiUrlType = "";

      expect(testValue).toBe("");
    });
  });
});
