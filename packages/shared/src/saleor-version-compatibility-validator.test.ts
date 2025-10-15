import { describe, expect, it } from "vitest";

import { SaleorVersionCompatibilityValidator } from "./saleor-version-compatibility-validator";

describe("SaleorVersionCompatibilityValidator", () => {
  describe("isSaleorCompatible", () => {
    it.each<[string, [number, number]]>([
      [">=3.10 <4", [3, 12]],
      [">=3.10 <4", [3, 999]],
      [">=3.10", [4, 0]],
      [">=3.10", [4, 1]],
      [">3.10", [3, 11]],
      /**
       * Note: -a suffix is Saleor staging version indicator.
       * The validator uses semver with includePrerelease: true, so [3, 10] will match ">=3.10"
       * even if it represents "3.10.0-a" internally.
       */
      [">=3.10", [3, 10]],
      [">3.10", [3, 11]],
    ])(
      'Returns true for app requirement "%s" and saleor version [%i, %i]',
      (appVersionReq, saleorSchemaVersion) => {
        expect(
          new SaleorVersionCompatibilityValidator(appVersionReq).isSaleorCompatible(
            saleorSchemaVersion,
          ),
        ).toBe(true);
      },
    );

    it.each<[string, [number, number]]>([
      [">=3.10 <4", [4, 0]],
      [">3.10 <4", [3, 10]],
      [">3.10", [3, 10]],
      [">=3.10", [2, 0]],
    ])(
      'Returns false for app requirement "%s" and saleor version [%i, %i]',
      (appVersionReq, saleorSchemaVersion) => {
        expect(
          new SaleorVersionCompatibilityValidator(appVersionReq).isSaleorCompatible(
            saleorSchemaVersion,
          ),
        ).toBe(false);
      },
    );
  });

  describe("isValid", () => {
    it.each<[string, string]>([
      [">=3.10 <4", "3.12.0"],
      [">=3.10 <4", "3.999.0"],
      [">=3.10", "4.0.0"],
      [">=3.10", "4.1.0"],
      [">3.10", "3.11.0"],
      /**
       * Note: -a suffix is Saleor staging version indicator.
       * The validator uses semver with includePrerelease: true.
       */
      [">=3.10", "3.10.0-a"],
      [">3.10", "3.11.0-a"],
      [">=3.13", "3.13.0"],
      [">=3.14", "3.14.0"],
    ])(
      'Returns true for app requirement "%s" and saleor version "%s"',
      (appVersionReq, saleorVersion) => {
        expect(new SaleorVersionCompatibilityValidator(appVersionReq).isValid(saleorVersion)).toBe(
          true,
        );
      },
    );

    it.each<[string, string]>([
      [">=3.10 <4", "4.0.0"],
      [">3.10 <4", "3.10.0"],
      [">3.10", "3.10.0"],
      [">=3.10", "2.0.0"],
      [">=3.13", "3.12.0"],
      [">=3.14", "3.13.0"],
    ])(
      'Returns false for app requirement "%s" and saleor version "%s"',
      (appVersionReq, saleorVersion) => {
        expect(new SaleorVersionCompatibilityValidator(appVersionReq).isValid(saleorVersion)).toBe(
          false,
        );
      },
    );
  });

  describe("validateOrThrow", () => {
    it.each<[string, string]>([
      [">=3.10 <4", "3.12.0"],
      [">=3.10 <4", "3.999.0"],
      [">=3.10", "4.0.0"],
      [">=3.10", "4.1.0"],
      [">3.10", "3.11.0"],
      /**
       * Note: -a suffix is Saleor staging version indicator.
       * The validator uses semver with includePrerelease: true.
       */
      [">=3.10", "3.10.0-a"],
      [">3.10", "3.11.0-a"],
    ])(
      'Does not throw for app requirement "%s" and saleor version "%s"',
      (appVersionReq, saleorVersion) => {
        expect(() =>
          new SaleorVersionCompatibilityValidator(appVersionReq).validateOrThrow(saleorVersion),
        ).not.toThrow();
      },
    );

    it.each<[string, string]>([
      [">=3.10 <4", "4.0.0"],
      [">3.10 <4", "3.10.0"],
      [">3.10", "3.10.0"],
      [">=3.10", "2.0.0"],
    ])(
      'Throws for app requirement "%s" and saleor version "%s"',
      (appVersionReq, saleorVersion) => {
        expect(() =>
          new SaleorVersionCompatibilityValidator(appVersionReq).validateOrThrow(saleorVersion),
        ).toThrow(
          `Your Saleor version (${saleorVersion}) doesn't match App's required version (semver: ${appVersionReq})`,
        );
      },
    );
  });
});
