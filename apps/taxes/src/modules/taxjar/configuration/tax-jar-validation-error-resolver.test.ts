import { describe, it, expect } from "vitest";
import { TaxJarValidationErrorResolver } from "./tax-jar-validation-error-resolver";
import { TaxjarError } from "taxjar/dist/util/types";

describe("TaxJarValidationErrorResolver", () => {
  const erroResolver = new TaxJarValidationErrorResolver();

  it("when not a TaxjarError, should return error with generic message", () => {
    const result = erroResolver.resolve("error");

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("Unknown error while validating TaxJar configuration.");
  });
  it("when TaxJarError && status 401, should return error with specific message", () => {
    const error = new TaxjarError("error", "detail", 401);

    const result = erroResolver.resolve(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe(
      "The provided API token is invalid. Please visit https://support.taxjar.com/article/160-how-do-i-get-a-sales-tax-api-token for more information.",
    );
  });
  it("when TaxJarError && status 404, should return error with specific message", () => {
    const error = new TaxjarError("error", "detail", 404);

    const result = erroResolver.resolve(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe(
      "The provided address is invalid. Please visit https://support.taxjar.com/article/659-address-validation to learn about address formatting.",
    );
  });
  it("when TaxJarError && other status, should return error with error detail message", () => {
    const error = new TaxjarError("error", "passed error message", 500);

    const result = erroResolver.resolve(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("passed error message");
  });
});
