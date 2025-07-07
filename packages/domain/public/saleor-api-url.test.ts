import { describe, expect, it } from "vitest";

import { createSaleorApiUrl, SaleorApiUrl, SaleorApiUrlValidationError } from "./saleor-api-url";

describe("SaleorApiUrl", () => {
  describe("create", () => {
    it("should create valid URL with https", () => {
      const result = createSaleorApiUrl("https://demo.saleor.io/graphql/");

      expect(result).toBe("https://demo.saleor.io/graphql/");
    });

    it("should create valid URL with http", () => {
      const result = createSaleorApiUrl("http://demo.saleor.io/graphql/");

      expect(result).toBe("http://demo.saleor.io/graphql/");
    });

    it("should reject empty URL", () => {
      expect(() => createSaleorApiUrl("")).toThrowErrorMatchingInlineSnapshot(`
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
        ]
        SaleorApiUrl is invalid]
      `);
    });

    it("should reject URL not starting with http/https", () => {
      expect(() => createSaleorApiUrl("ftp://demo.saleor.io/graphql/"))
        .toThrowErrorMatchingInlineSnapshot(`
          [SaleorApiUrlValidationError: ZodError: [
            {
              "code": "custom",
              "message": "Invalid input: must start with \\"http://\\" or \\"https://\\"",
              "path": []
            }
          ]
          SaleorApiUrl is invalid]
        `);
    });

    it("should reject URL not ending with /graphql/", () => {
      expect(() => createSaleorApiUrl("https://demo.saleor.io/"))
        .toThrowErrorMatchingInlineSnapshot(`
          [SaleorApiUrlValidationError: ZodError: [
            {
              "code": "invalid_string",
              "validation": {
                "endsWith": "/graphql/"
              },
              "message": "Invalid input: must end with \\"/graphql/\\"",
              "path": []
            }
          ]
          SaleorApiUrl is invalid]
        `);
    });

    it("should reject incorrect URL", () => {
      expect(() => createSaleorApiUrl("demo.saleor.io/graphql/"))
        .toThrowErrorMatchingInlineSnapshot(`
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
          ]
          SaleorApiUrl is invalid]
        `);
    });

    it("shouldn't be assignable without createSaleorApiUrl", () => {
      // @ts-expect-error - if this fails - it means the type is not branded
      const testValue: SaleorApiUrl = "";

      expect(testValue).toBe("");
    });
  });
});
