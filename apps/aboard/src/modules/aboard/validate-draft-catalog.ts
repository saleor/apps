import { BaseError } from "@saleor/errors";
import { err, ok, type Result } from "neverthrow";

import { type SaleorDraftCatalog } from "./types";

export const DraftCatalogValidationError = BaseError.subclass(
  "ValidateDraftCatalog.DraftCatalogValidationError",
  {
    props: {
      _brand: "ValidateDraftCatalog.DraftCatalogValidationError" as const,
      issues: [] as string[],
    },
  },
);

export type DraftCatalogValidationError = InstanceType<typeof DraftCatalogValidationError>;

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

const addUnique = (
  seen: Map<string, string>,
  {
    value,
    owner,
    label,
    issues,
  }: { value: string; owner: string; label: string; issues: string[] },
) => {
  if (seen.has(value)) {
    const previous = seen.get(value);

    issues.push(`${label} ${value} is used by both ${previous} and ${owner}.`);

    return;
  }

  seen.set(value, owner);
};

export const validateDraftCatalog = (
  catalog: SaleorDraftCatalog,
): Result<SaleorDraftCatalog, DraftCatalogValidationError> => {
  const issues: string[] = [];
  const categoryIds = new Map<string, string>();
  const categoryPaths = new Map<string, string>();

  for (const category of catalog.categories ?? []) {
    addUnique(categoryIds, {
      value: category.id,
      owner: category.name,
      label: "Category ID",
      issues,
    });
    const pathKey = `${category.parentId ?? "root"}/${category.slug || slugify(category.name)}`;

    addUnique(categoryPaths, {
      value: pathKey,
      owner: category.name,
      label: "Category slug path",
      issues,
    });
  }

  for (const category of catalog.categories ?? []) {
    if (category.parentId && !categoryIds.has(category.parentId)) {
      issues.push(`${category.name} references missing parent category ${category.parentId}.`);
    }
  }

  const productIds = new Map<string, string>();
  const productSlugs = new Map<string, string>();
  const productTypeSlugs = new Map<string, string>();
  const variantIds = new Map<string, string>();
  const skus = new Map<string, string>();

  for (const product of catalog.products) {
    addUnique(productIds, { value: product.id, owner: product.name, label: "Product ID", issues });
    addUnique(productSlugs, {
      value: product.slug || slugify(product.name),
      owner: product.name,
      label: "Product slug",
      issues,
    });

    const productType = product.productType?.trim() || "Default";
    const productTypeSlug = slugify(productType);
    const previousType = productTypeSlugs.get(productTypeSlug);

    if (previousType && previousType !== productType) {
      issues.push(`Product types ${previousType} and ${productType} generate the same slug.`);
    } else {
      productTypeSlugs.set(productTypeSlug, productType);
    }

    if (product.categoryId && !categoryIds.has(product.categoryId)) {
      issues.push(`${product.name} references missing category ${product.categoryId}.`);
    }

    for (const variant of product.variants ?? []) {
      addUnique(variantIds, {
        value: variant.id,
        owner: product.name,
        label: "Variant ID",
        issues,
      });

      if (variant.sku) {
        addUnique(skus, { value: variant.sku, owner: product.name, label: "SKU", issues });
      }

      if (variant.price && variant.price.currency !== catalog.channel.currencyCode) {
        issues.push(
          `${product.name} variant ${variant.id} uses ${variant.price.currency}, but the channel uses ${catalog.channel.currencyCode}.`,
        );
      }
    }
  }

  if (issues.length) {
    return err(
      new DraftCatalogValidationError(
        `Catalog draft has ${issues.length} validation error${
          issues.length === 1 ? "" : "s"
        }: ${issues.join("; ")}`,
        { props: { issues } },
      ),
    );
  }

  return ok(catalog);
};
