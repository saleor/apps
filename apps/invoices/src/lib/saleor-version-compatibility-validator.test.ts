import { describe, expect, it } from "vitest";
import { SaleorVersionCompatibilityValidator } from "./saleor-version-compatibility-validator";

describe("SaleorVersionCompatibilityValidator", () => {
  it.each([
    [">=3.10 <4", "3.12"],
    [">=3.10 <4", "3.999"],
    [">=3.10", "4"],
    [">=3.10", "4.1"],
    [">3.10", "3.11"],
    /**
     * -a suffix is Saleor staging version indicator
     */
    [">=3.10", "3.10-a"],
    [">3.10", "3.11-a"],
  ])('Passes for app requirement "%s" and saleor version "%s"', (appVersionReq, saleorVersion) => {
    expect(() =>
      new SaleorVersionCompatibilityValidator(appVersionReq).validateOrThrow(saleorVersion)
    ).not.to.throw();
  });

  it.each([
    [">=3.10 <4", "4"],
    [">3.10 <4", "3.10"],
    [">3.10", "3.10"],
    [">=3.10", "2"],
  ])('Throws for app requirement "%s" and saleor version "%s"', (appVersionReq, saleorVersion) => {
    expect(() =>
      new SaleorVersionCompatibilityValidator(appVersionReq).validateOrThrow(saleorVersion)
    ).to.throw();
  });
});
