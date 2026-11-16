import { BaseError } from "@saleor/errors";
import { err, ok, type Result } from "neverthrow";

export const MAX_IMPORT_PRODUCTS = 1_000;
export const MAX_IMPORT_VARIANTS = 5_000;

export const CatalogSizeError = BaseError.subclass("CatalogLimits.CatalogSizeError", {
  props: { _brand: "CatalogLimits.CatalogSizeError" as const },
});

export type CatalogSizeError = InstanceType<typeof CatalogSizeError>;

export const checkCatalogSize = (
  productCount: number,
  variantCount: number,
): Result<void, CatalogSizeError> => {
  if (productCount > MAX_IMPORT_PRODUCTS) {
    return err(
      new CatalogSizeError(`Catalog imports are limited to ${MAX_IMPORT_PRODUCTS} products.`),
    );
  }

  if (variantCount > MAX_IMPORT_VARIANTS) {
    return err(
      new CatalogSizeError(`Catalog imports are limited to ${MAX_IMPORT_VARIANTS} variants.`),
    );
  }

  return ok(undefined);
};
