import { describe, expect, it } from "vitest";

import { checkCatalogSize, MAX_IMPORT_PRODUCTS, MAX_IMPORT_VARIANTS } from "./catalog-limits";

describe("catalog limits", () => {
  it("accepts the documented maximum", () => {
    expect(checkCatalogSize(MAX_IMPORT_PRODUCTS, MAX_IMPORT_VARIANTS).isOk()).toBe(true);
  });

  it("rejects catalogs above either maximum", () => {
    expect(checkCatalogSize(MAX_IMPORT_PRODUCTS + 1, 0)._unsafeUnwrapErr().message).toContain(
      "1000 products",
    );
    expect(checkCatalogSize(1, MAX_IMPORT_VARIANTS + 1)._unsafeUnwrapErr().message).toContain(
      "5000 variants",
    );
  });
});
