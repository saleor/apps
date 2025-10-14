import { describe, expect, it } from "vitest";

import { SaleorVersionCompatibilityValidator } from "./saleor-version-compatibility-validator";

describe("SaleorVersionCompatibilityValidator", () => {
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
