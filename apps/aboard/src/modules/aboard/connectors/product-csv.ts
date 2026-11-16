import { BaseError } from "@saleor/errors";
import { parse } from "csv-parse/browser/esm/sync";
import { err, ok, type Result } from "neverthrow";

import { MAX_IMPORT_PRODUCTS, MAX_IMPORT_VARIANTS } from "../catalog-limits";
import { hash } from "../hash";
import { sourceChannel } from "../source-channel";
import {
  type DraftCategory,
  type DraftMedia,
  type DraftProduct,
  type SaleorDraftCatalog,
} from "../types";

export const PRODUCT_CSV_CONNECTOR_ID = "product-csv";
export const PRODUCT_CSV_VERSION = "v1";
export const PRODUCT_CSV_CHANNEL_NAME = "Product CSV Import";
export const PRODUCT_CSV_CHANNEL_SLUG = "product-csv-import";
export const PRODUCT_CSV_DEFAULT_CURRENCY = "USD";
export const PRODUCT_CSV_DEFAULT_CATEGORY_NAME = "Imported Products";
export const PRODUCT_CSV_DEFAULT_CATEGORY_SLUG = "imported-products";

export type ProductCsvValidationIssue = {
  row: number;
  column: string;
  message: string;
};

export const ProductCsvValidationError = BaseError.subclass(
  "ProductCsv.ProductCsvValidationError",
  {
    props: {
      _brand: "ProductCsv.ProductCsvValidationError" as const,
      issues: [] as ProductCsvValidationIssue[],
    },
  },
);

export type ProductCsvValidationError = InstanceType<typeof ProductCsvValidationError>;

const validationError = (issues: ProductCsvValidationIssue[]) =>
  new ProductCsvValidationError(
    `CSV has ${issues.length} validation error${issues.length === 1 ? "" : "s"}.`,
    {
      props: { issues },
    },
  );

type CsvRow = {
  rowNumber: number;
  values: Record<string, string>;
};

type ProductAccumulator = {
  product: DraftProduct;
  productFieldValues: Map<string, string>;
  mediaUrls: Set<string>;
};

const PRODUCT_ATTRIBUTE_PREFIX = "product_attribute:";
const VARIANT_ATTRIBUTE_PREFIX = "variant_attribute:";

const FIXED_COLUMNS = [
  "product_id",
  "product_name",
  "product_slug",
  "product_description",
  "product_type",
  "category_path",
  "is_published",
  "variant_id",
  "variant_name",
  "sku",
  "currency",
  "price",
  "image_url",
  "image_alt",
];

const PRODUCT_FIELD_COLUMNS = [
  "product_name",
  "product_slug",
  "product_description",
  "product_type",
  "category_path",
  "is_published",
];

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

const parseBoolean = (value: string) => {
  if (!value) {
    return true;
  }

  if (["true", "1", "yes", "y"].includes(value.toLowerCase())) {
    return true;
  }

  if (["false", "0", "no", "n"].includes(value.toLowerCase())) {
    return false;
  }

  return undefined;
};

const categorySegments = (categoryPath: string) =>
  (categoryPath.trim() || PRODUCT_CSV_DEFAULT_CATEGORY_NAME)
    .split(">")
    .map((segment) => segment.trim())
    .filter(Boolean);

const categoryIdForSegments = (segments: string[]) =>
  `category:${segments.map((segment) => slugify(segment)).join("/")}`;

const categorySlugForSegments = (segments: string[]) =>
  slugify(segments[segments.length - 1] ?? "");

const categoryNameForSegments = (segments: string[]) =>
  segments[segments.length - 1] ?? PRODUCT_CSV_DEFAULT_CATEGORY_NAME;

const addCategoryPath = (categories: Map<string, DraftCategory>, categoryPath: string) => {
  const segments = categorySegments(categoryPath);
  let parentId: string | undefined;

  for (let index = 0; index < segments.length; index += 1) {
    const currentSegments = segments.slice(0, index + 1);
    const id = categoryIdForSegments(currentSegments);

    if (!categories.has(id)) {
      categories.set(id, {
        id,
        name: categoryNameForSegments(currentSegments),
        slug: categorySlugForSegments(currentSegments),
        ...(parentId ? { parentId } : {}),
      });
    }

    parentId = id;
  }

  return parentId ?? categoryIdForSegments([PRODUCT_CSV_DEFAULT_CATEGORY_NAME]);
};

const attributeColumns = (headers: string[], prefix: string) =>
  headers.filter((header) => header.startsWith(prefix) && header.slice(prefix.length).trim());

const attributeValues = (row: CsvRow, columns: string[], prefix: string) =>
  columns
    .map((column) => ({
      attribute: column.slice(prefix.length).trim(),
      value: row.values[column]?.trim() ?? "",
    }))
    .filter((attribute) => attribute.value);

const addIssue = (issues: ProductCsvValidationIssue[], issue: ProductCsvValidationIssue) => {
  issues.push(issue);
};

const requireValue = (row: CsvRow, column: string, issues: ProductCsvValidationIssue[]) => {
  const value = row.values[column]?.trim() ?? "";

  if (!value) {
    addIssue(issues, { row: row.rowNumber, column, message: `Add a value for ${column}.` });
  }

  return value;
};

const parseRows = (
  content: string,
): Result<{ headers: string[]; rows: CsvRow[] }, ProductCsvValidationError> => {
  let records: string[][];

  try {
    records = parse(content, {
      bom: true,
      relax_column_count: false,
      skip_empty_lines: true,
      trim: false,
    }) as string[][];
  } catch (error) {
    return err(
      validationError([
        {
          row: 1,
          column: "csv",
          message: error instanceof Error ? error.message : "Fix the CSV formatting.",
        },
      ]),
    );
  }

  const headers = records[0]?.map((header) => header.trim()) ?? [];

  return ok({
    headers,
    rows: records.slice(1).map((record, index) => ({
      rowNumber: index + 2,
      values: Object.fromEntries(
        headers.map((header, columnIndex) => [header, record[columnIndex]?.trim() ?? ""]),
      ),
    })),
  });
};

const collectCurrency = (rows: CsvRow[], issues: ProductCsvValidationIssue[]) => {
  const currencies = new Set(
    rows
      .map((row) => row.values.currency?.trim().toUpperCase())
      .filter((value): value is string => Boolean(value)),
  );

  if (currencies.size > 1) {
    for (const row of rows) {
      if (row.values.currency) {
        addIssue(issues, {
          row: row.rowNumber,
          column: "currency",
          message: "Use one currency per CSV import.",
        });
      }
    }
  }

  return [...currencies][0] ?? PRODUCT_CSV_DEFAULT_CURRENCY;
};

export const parseProductCsvCatalog = (
  content: string,
  {
    fileName = "products.csv",
    sourceInstanceId = hash(content),
  }: { fileName?: string; sourceInstanceId?: string } = {},
): Result<SaleorDraftCatalog, ProductCsvValidationError> => {
  const issues: ProductCsvValidationIssue[] = [];
  const parsedRows = parseRows(content);

  if (parsedRows.isErr()) {
    return err(parsedRows.error);
  }

  const { headers, rows } = parsedRows.value;
  const headerSet = new Set(headers);

  if (!rows.length) {
    return err(
      validationError([{ row: 1, column: "product_id", message: "Add at least one product row." }]),
    );
  }

  for (const column of ["product_id", "product_name", "price"]) {
    if (!headerSet.has(column)) {
      addIssue(issues, { row: 1, column, message: `Add the ${column} column.` });
    }
  }

  if (!headerSet.has("variant_id") && !headerSet.has("sku")) {
    addIssue(issues, {
      row: 1,
      column: "variant_id",
      message: "Add variant_id or sku so variants can be identified.",
    });
  }

  const unknownFixedColumns = headers.filter(
    (header) =>
      !FIXED_COLUMNS.includes(header) &&
      !header.startsWith(PRODUCT_ATTRIBUTE_PREFIX) &&
      !header.startsWith(VARIANT_ATTRIBUTE_PREFIX),
  );

  for (const column of unknownFixedColumns) {
    addIssue(issues, {
      row: 1,
      column,
      message: `Rename ${column} or prefix it with product_attribute: or variant_attribute:.`,
    });
  }

  const productAttributeColumns = attributeColumns(headers, PRODUCT_ATTRIBUTE_PREFIX);
  const variantAttributeColumns = attributeColumns(headers, VARIANT_ATTRIBUTE_PREFIX);
  const currency = collectCurrency(rows, issues);
  const categories = new Map<string, DraftCategory>();
  const products = new Map<string, ProductAccumulator>();
  const variantIds = new Set<string>();

  for (const row of rows) {
    const productId = requireValue(row, "product_id", issues);
    const productName = requireValue(row, "product_name", issues);
    const priceText = requireValue(row, "price", issues);
    const sku = row.values.sku?.trim() ?? "";
    const explicitVariantId = row.values.variant_id?.trim() ?? "";
    const variantId = explicitVariantId || (productId && sku ? `${productId}:${sku}` : "");

    if (!variantId) {
      addIssue(issues, {
        row: row.rowNumber,
        column: "variant_id",
        message: "Add variant_id or sku for this variant.",
      });
    }

    const price = Number(priceText);

    if (priceText && (!Number.isFinite(price) || price < 0)) {
      addIssue(issues, {
        row: row.rowNumber,
        column: "price",
        message: "Use a non-negative numeric price.",
      });
    }

    const isPublished = parseBoolean(row.values.is_published?.trim() ?? "");

    if (isPublished === undefined) {
      addIssue(issues, {
        row: row.rowNumber,
        column: "is_published",
        message: "Use true/false, yes/no, or 1/0.",
      });
    }

    if (!productId || !productName || !variantId) {
      continue;
    }

    const categoryId = addCategoryPath(categories, row.values.category_path ?? "");
    const productAttributes = attributeValues(
      row,
      productAttributeColumns,
      PRODUCT_ATTRIBUTE_PREFIX,
    );
    const productType = row.values.product_type?.trim() || "Default";

    let accumulator = products.get(productId);

    if (!accumulator) {
      accumulator = {
        product: {
          id: productId,
          name: productName,
          slug: row.values.product_slug?.trim() || undefined,
          description: row.values.product_description?.trim() || undefined,
          productType,
          categoryId,
          isPublished,
          attributes: productAttributes,
          media: [],
          variants: [],
        },
        productFieldValues: new Map(),
        mediaUrls: new Set(),
      };

      for (const column of PRODUCT_FIELD_COLUMNS) {
        accumulator.productFieldValues.set(column, row.values[column]?.trim() ?? "");
      }

      for (const attribute of productAttributes) {
        accumulator.productFieldValues.set(
          `${PRODUCT_ATTRIBUTE_PREFIX}${attribute.attribute}`,
          attribute.value,
        );
      }

      products.set(productId, accumulator);
    } else {
      for (const column of PRODUCT_FIELD_COLUMNS) {
        const previous = accumulator.productFieldValues.get(column) ?? "";
        const next = row.values[column]?.trim() ?? "";

        if (previous !== next) {
          addIssue(issues, {
            row: row.rowNumber,
            column,
            message: `Keep ${column} the same for product ${productId}.`,
          });
        }
      }

      for (const attribute of productAttributes) {
        const column = `${PRODUCT_ATTRIBUTE_PREFIX}${attribute.attribute}`;
        const previous = accumulator.productFieldValues.get(column) ?? "";

        if (previous !== attribute.value) {
          addIssue(issues, {
            row: row.rowNumber,
            column,
            message: `Keep ${column} the same for product ${productId}.`,
          });
        }
      }
    }

    if (!Number.isFinite(price)) {
      continue;
    }

    if (variantIds.has(variantId)) {
      addIssue(issues, {
        row: row.rowNumber,
        column: "variant_id",
        message: `Variant ${variantId} is duplicated.`,
      });
      continue;
    }

    variantIds.add(variantId);

    const imageUrl = row.values.image_url?.trim() ?? "";

    if (imageUrl && !accumulator.mediaUrls.has(imageUrl)) {
      const media: DraftMedia = {
        url: imageUrl,
        ...(row.values.image_alt?.trim() ? { alt: row.values.image_alt.trim() } : {}),
      };

      accumulator.product.media?.push(media);
      accumulator.mediaUrls.add(imageUrl);
    }

    accumulator.product.variants?.push({
      id: variantId,
      name: row.values.variant_name?.trim() || sku || productName,
      sku: sku || undefined,
      attributes: attributeValues(row, variantAttributeColumns, VARIANT_ATTRIBUTE_PREFIX),
      price: {
        currency,
        amount: price,
      },
    });
  }

  if (products.size > MAX_IMPORT_PRODUCTS) {
    addIssue(issues, {
      row: 1,
      column: "product_id",
      message: `Product CSV imports are limited to ${MAX_IMPORT_PRODUCTS} products.`,
    });
  }

  const variantCount = [...products.values()].reduce(
    (count, item) => count + (item.product.variants?.length ?? 0),
    0,
  );

  if (variantCount > MAX_IMPORT_VARIANTS) {
    addIssue(issues, {
      row: 1,
      column: "variant_id",
      message: `Product CSV imports are limited to ${MAX_IMPORT_VARIANTS} variants.`,
    });
  }

  if (issues.length) {
    return err(validationError(issues));
  }

  return ok({
    source: {
      connectorId: PRODUCT_CSV_CONNECTOR_ID,
      version: PRODUCT_CSV_VERSION,
      name: fileName ? `Product CSV: ${fileName}` : "Product CSV",
      instanceId: sourceInstanceId,
    },
    defaultCountry: "US",
    channel: sourceChannel({
      name: PRODUCT_CSV_CHANNEL_NAME,
      slug: PRODUCT_CSV_CHANNEL_SLUG,
      sourceName: fileName || "Product CSV",
      sourceInstanceId,
      currencyCode: currency,
    }),
    categories: [...categories.values()],
    products: [...products.values()].map((item) => item.product),
  });
};
