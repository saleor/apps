import { describe, expect, it } from "vitest";

import { type SaleorDraftCatalog } from "./types";
import { DraftCatalogValidationError, validateDraftCatalog } from "./validate-draft-catalog";

describe("validateDraftCatalog", () => {
  it("collects identity, reference, currency, and slug conflicts", () => {
    const catalog: SaleorDraftCatalog = {
      source: { connectorId: "test", version: "1", name: "Test", instanceId: "test-1" },
      channel: { name: "Test", slug: "test", currencyCode: "USD" },
      categories: [{ id: "category-1", name: "Child", parentId: "missing" }],
      products: [
        {
          id: "p-1",
          name: "First Product",
          slug: "same",
          categoryId: "missing-category",
          productType: "T Shirt",
          variants: [{ id: "v-1", sku: "SKU", price: { currency: "USD", amount: 10 } }],
        },
        {
          id: "p-2",
          name: "Second Product",
          slug: "same",
          productType: "T-Shirt",
          variants: [{ id: "v-1", sku: "SKU", price: { currency: "EUR", amount: 10 } }],
        },
      ],
    };

    const error = validateDraftCatalog(catalog)._unsafeUnwrapErr();

    expect(error).toBeInstanceOf(DraftCatalogValidationError);

    const issues = error.issues.join("\n");

    expect(issues).toContain("missing parent category");
    expect(issues).toContain("missing category");
    expect(issues).toContain("Product slug same");
    expect(issues).toContain("generate the same slug");
    expect(issues).toContain("Variant ID v-1");
    expect(issues).toContain("SKU SKU");
    expect(issues).toContain("uses EUR");
  });
});
