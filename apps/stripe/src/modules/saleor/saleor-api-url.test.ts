import { describe, expect, it } from "vitest";

import { SaleorApiUrl } from "./saleor-api-url";

describe("SaleorApiUrl", () => {
  describe("create", () => {
    it("should create valid URL", () => {
      const result = SaleorApiUrl.create({
        url: "https://demo.saleor.io/graphql/",
      });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap().url).toBe("https://demo.saleor.io/graphql/");
    });

    it("should reject empty URL", () => {
      const result = SaleorApiUrl.create({ url: "" });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr().message).toBe("Saleor API URL cannot be empty");
    });

    it("should reject URL not starting with http/https", () => {
      const result = SaleorApiUrl.create({ url: "ftp://demo.saleor.io/graphql/" });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(SaleorApiUrl.ValidationError);
      expect(result._unsafeUnwrapErr().message).toBe("Saleor API URL must start with http / https");
    });

    it("should reject URL not ending with /graphql/", () => {
      const result = SaleorApiUrl.create({ url: "https://demo.saleor.io/" });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(SaleorApiUrl.ValidationError);
      expect(result._unsafeUnwrapErr().message).toBe("Saleor API URL must end with /graphql/");
    });
  });
});
