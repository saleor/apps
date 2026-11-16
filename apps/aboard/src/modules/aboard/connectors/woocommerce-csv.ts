import { BaseError } from "@saleor/errors";
import { parse } from "csv-parse/browser/esm/sync";
import { err, ok, type Result } from "neverthrow";

import { MAX_IMPORT_PRODUCTS, MAX_IMPORT_VARIANTS } from "../catalog-limits";
import { hash } from "../hash";
import { sourceChannel } from "../source-channel";
import {
  type DraftAttributeValue,
  type DraftCategory,
  type DraftMedia,
  type DraftProduct,
  type DraftProductVariant,
  type SaleorDraftCatalog,
} from "../types";

export const WOOCOMMERCE_CSV_CONNECTOR_ID = "woocommerce-csv";
export const WOOCOMMERCE_CSV_VERSION = "woocommerce-10.8.1";
export const WOOCOMMERCE_CSV_CHANNEL_NAME = "WooCommerce CSV Import";
export const WOOCOMMERCE_CSV_CHANNEL_SLUG = "woocommerce-csv-import";
export const WOOCOMMERCE_CSV_DEFAULT_CATEGORY_NAME = "WooCommerce Products";
export const WOOCOMMERCE_CSV_DEFAULT_CATEGORY_SLUG = "woocommerce-products";

export type WoocommerceCsvValidationIssue = {
  row: number;
  column: string;
  message: string;
};

export const WoocommerceCsvValidationError = BaseError.subclass(
  "WoocommerceCsv.WoocommerceCsvValidationError",
  {
    props: {
      _brand: "WoocommerceCsv.WoocommerceCsvValidationError" as const,
      issues: [] as WoocommerceCsvValidationIssue[],
    },
  },
);

export type WoocommerceCsvValidationError = InstanceType<typeof WoocommerceCsvValidationError>;

const validationError = (issues: WoocommerceCsvValidationIssue[]) =>
  new WoocommerceCsvValidationError(
    `WooCommerce CSV has ${issues.length} validation error${issues.length === 1 ? "" : "s"}.`,
    {
      props: { issues },
    },
  );

export type WoocommerceCsvOptions = {
  currencyCode: string;
  decimalSeparator: "." | ",";
};

export const parseWoocommerceCsvOptions = (
  input: Record<string, unknown>,
): Result<WoocommerceCsvOptions, WoocommerceCsvValidationError> => {
  const currencyCode = String(input.currencyCode ?? "")
    .trim()
    .toUpperCase();
  const decimalSeparator = input.decimalSeparator;

  if (!/^[A-Z]{3}$/.test(currencyCode)) {
    return err(
      validationError([
        { row: 1, column: "currency", message: "Choose a three-letter currency code." },
      ]),
    );
  }

  if (decimalSeparator !== "." && decimalSeparator !== ",") {
    return err(
      validationError([
        {
          row: 1,
          column: "decimal_separator",
          message: "Choose dot or comma as the decimal separator.",
        },
      ]),
    );
  }

  return ok({ currencyCode, decimalSeparator });
};

type CsvRow = {
  rowNumber: number;
  values: Record<string, string>;
};

type ProductAccumulator = {
  product: DraftProduct;
  rowNumber: number;
  variantIds: Set<string>;
  mediaUrls: Set<string>;
};

const REQUIRED_COLUMNS = ["Type", "Name"];
const PRODUCT_TYPE = "WooCommerce Product";
const ATTRIBUTE_NAME_PATTERN = /^Attribute (\d+) name$/;

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

const parseRows = (
  content: string,
): Result<{ headers: string[]; rows: CsvRow[] }, WoocommerceCsvValidationError> => {
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

const addIssue = (
  issues: WoocommerceCsvValidationIssue[],
  issue: WoocommerceCsvValidationIssue,
) => {
  issues.push(issue);
};

const splitWooList = (value: string) => {
  const items: string[] = [];
  let current = "";
  let escaped = false;

  for (const char of value) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === ",") {
      if (current.trim()) {
        items.push(current.trim());
      }
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    items.push(current.trim());
  }

  return items;
};

const categorySegments = (categoryPath: string) =>
  (categoryPath.trim() || WOOCOMMERCE_CSV_DEFAULT_CATEGORY_NAME)
    .split(">")
    .map((segment) => segment.trim())
    .filter(Boolean);

const categoryIdForSegments = (segments: string[]) =>
  `woocommerce-category:${segments.map((segment) => slugify(segment)).join("/")}`;

const categorySlugForSegments = (segments: string[]) =>
  slugify(segments[segments.length - 1] ?? "");

const categoryNameForSegments = (segments: string[]) =>
  segments[segments.length - 1] ?? WOOCOMMERCE_CSV_DEFAULT_CATEGORY_NAME;

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

  return parentId ?? categoryIdForSegments([WOOCOMMERCE_CSV_DEFAULT_CATEGORY_NAME]);
};

const typeTokens = (row: CsvRow) =>
  splitWooList(row.values.Type ?? "").map((type) => type.trim().toLowerCase());

const enabledWooFlag = (value: string | undefined) =>
  ["1", "true", "yes"].includes(value?.trim().toLowerCase() ?? "");

const unsupportedProductKind = (row: CsvRow) => {
  const tokens = typeTokens(row);

  return (
    tokens.includes("external") ||
    tokens.includes("virtual") ||
    tokens.includes("downloadable") ||
    enabledWooFlag(row.values.Virtual) ||
    enabledWooFlag(row.values.Downloadable) ||
    Boolean(row.values.Downloads?.trim())
  );
};

const rowSku = (row: CsvRow) => row.values.SKU?.trim() ?? "";

const rowId = (row: CsvRow) => row.values.ID?.trim() ?? "";

const rowSourceKey = (row: CsvRow) => rowSku(row) || (rowId(row) ? `id:${rowId(row)}` : "");

const externalSourceId = (id: string) => `${WOOCOMMERCE_CSV_CONNECTOR_ID}:${id}`;

const parsePublished = (value: string) => {
  const normalized = value.trim().toLowerCase();

  if (!normalized || normalized === "1" || normalized === "true") {
    return true;
  }

  if (normalized === "0" || normalized === "-1" || normalized === "false") {
    return false;
  }

  return undefined;
};

const parsePrice = (row: CsvRow, decimalSeparator: WoocommerceCsvOptions["decimalSeparator"]) => {
  const salePrice = row.values["Sale price"]?.trim() ?? "";
  const regularPrice = row.values["Regular price"]?.trim() ?? "";
  const priceText = salePrice || regularPrice;

  if (!priceText) {
    return undefined;
  }

  const escapedSeparator = decimalSeparator === "." ? "\\." : ",";

  if (!new RegExp(`^[0-9]+(?:${escapedSeparator}[0-9]+)?$`).test(priceText)) {
    return undefined;
  }

  const price = Number(decimalSeparator === "," ? priceText.replace(",", ".") : priceText);

  if (!Number.isFinite(price) || price < 0) {
    return undefined;
  }

  return price;
};

const collectAttributeColumns = (headers: string[]) =>
  headers
    .map((header) => {
      const match = header.match(ATTRIBUTE_NAME_PATTERN);

      return match ? Number(match[1]) : null;
    })
    .filter((index): index is number => index !== null)
    .sort((left, right) => left - right);

type WooAttribute = {
  name: string;
  values: string[];
  visible: boolean;
  global: boolean;
};

const wooAttributes = (row: CsvRow, attributeIndexes: number[]): WooAttribute[] =>
  attributeIndexes.flatMap((index) => {
    const name = row.values[`Attribute ${index} name`]?.trim() ?? "";
    const value = row.values[`Attribute ${index} value(s)`]?.trim() ?? "";

    if (!name || !value) {
      return [];
    }

    return [
      {
        name,
        values: splitWooList(value),
        visible: enabledWooFlag(row.values[`Attribute ${index} visible`]),
        global: enabledWooFlag(row.values[`Attribute ${index} global`]),
      },
    ];
  });

const productAttributeValues = (attributes: WooAttribute[]) =>
  attributes
    .filter((attribute) => attribute.visible)
    .map(({ name, values }) => ({
      attribute: name,
      value: values.join(", "),
    }));

const variantAttributeValues = (attributes: WooAttribute[]) =>
  attributes.flatMap(({ name, values }) =>
    values.length ? [{ attribute: name, value: values[0] }] : [],
  );

const attributeMetadata = (attributes: WooAttribute[]) =>
  attributes.flatMap(({ name, visible, global }) => {
    const key = `woocommerce.attribute.${slugify(name)}`;

    return [
      { attribute: `${key}.visible`, value: String(visible) },
      { attribute: `${key}.global`, value: String(global) },
    ];
  });

const metadataValues = (row: CsvRow) =>
  [
    ["woocommerce.id", rowId(row)],
    ["woocommerce.sku", rowSku(row)],
    ["woocommerce.type", row.values.Type],
    ["woocommerce.tags", row.values.Tags],
    ["woocommerce.stock", row.values.Stock],
    ["woocommerce.in_stock", row.values["In stock?"]],
    ["woocommerce.external_url", row.values["External URL"]],
  ]
    .map(([attribute, value]) => ({
      attribute,
      value: value?.trim() ?? "",
    }))
    .filter((metadata): metadata is DraftAttributeValue => Boolean(metadata.value));

const mediaValues = (row: CsvRow) =>
  splitWooList(row.values.Images ?? "").map((url): DraftMedia => ({ url }));

const productName = (row: CsvRow) => row.values.Name?.trim() ?? "";

const productDescription = (row: CsvRow) =>
  row.values.Description?.trim() || row.values["Short description"]?.trim() || undefined;

const variationParentKey = (row: CsvRow) => {
  const parent = row.values.Parent?.trim() ?? "";

  if (!parent) {
    return "";
  }

  return parent.startsWith("id:") ? parent : parent;
};

const registerParentLookup = (lookup: Map<string, string>, row: CsvRow, sourceKey: string) => {
  const sku = rowSku(row);
  const id = rowId(row);

  if (sku) {
    lookup.set(sku, sourceKey);
  }

  if (id) {
    lookup.set(id, sourceKey);
    lookup.set(`id:${id}`, sourceKey);
  }
};

export const parseWoocommerceCsvCatalog = (
  content: string,
  options: WoocommerceCsvOptions,
  {
    fileName = "woocommerce-products.csv",
    sourceInstanceId = hash(content),
  }: { fileName?: string; sourceInstanceId?: string } = {},
): Result<SaleorDraftCatalog, WoocommerceCsvValidationError> => {
  const issues: WoocommerceCsvValidationIssue[] = [];
  const parsedRows = parseRows(content);

  if (parsedRows.isErr()) {
    return err(parsedRows.error);
  }

  const { headers, rows } = parsedRows.value;
  const headerSet = new Set(headers);

  if (!rows.length) {
    return err(
      validationError([
        { row: 1, column: "Name", message: "Add at least one WooCommerce product row." },
      ]),
    );
  }

  for (const column of REQUIRED_COLUMNS) {
    if (!headerSet.has(column)) {
      addIssue(issues, { row: 1, column, message: `Add the ${column} column.` });
    }
  }

  if (!headerSet.has("SKU") && !headerSet.has("ID")) {
    addIssue(issues, {
      row: 1,
      column: "SKU",
      message: "Add SKU or ID so WooCommerce products can be identified.",
    });
  }

  const attributeIndexes = collectAttributeColumns(headers);
  const categories = new Map<string, DraftCategory>();
  const products = new Map<string, ProductAccumulator>();
  const parentLookup = new Map<string, string>();

  for (const row of rows) {
    const tokens = typeTokens(row);
    const isVariation = tokens.includes("variation");

    if (unsupportedProductKind(row)) {
      addIssue(issues, {
        row: row.rowNumber,
        column: "Type",
        message: "External, virtual, and downloadable WooCommerce products are not supported.",
      });
      continue;
    }

    const isSupportedParent =
      !isVariation && (tokens.includes("simple") || tokens.includes("variable"));

    if (!isSupportedParent) {
      continue;
    }

    const sourceKey = rowSourceKey(row);
    const name = productName(row);

    if (!sourceKey) {
      addIssue(issues, {
        row: row.rowNumber,
        column: "SKU",
        message: "Add SKU or ID for this WooCommerce product.",
      });
      continue;
    }

    if (!name) {
      addIssue(issues, { row: row.rowNumber, column: "Name", message: "Add a product name." });
      continue;
    }

    const published = parsePublished(row.values.Published ?? "");

    if (published === undefined) {
      addIssue(issues, {
        row: row.rowNumber,
        column: "Published",
        message: "Use 1, 0, -1, true, or false.",
      });
    }

    const categoryId = addCategoryPath(
      categories,
      splitWooList(row.values.Categories ?? "")[0] ?? "",
    );
    const media = mediaValues(row);
    const attributes = wooAttributes(row, attributeIndexes);
    const accumulator: ProductAccumulator = {
      product: {
        id: externalSourceId(sourceKey),
        name,
        description: productDescription(row),
        productType: PRODUCT_TYPE,
        categoryId,
        isPublished: published,
        metadata: [...metadataValues(row), ...attributeMetadata(attributes)],
        media,
        attributes: productAttributeValues(attributes),
        variants: [],
      },
      rowNumber: row.rowNumber,
      variantIds: new Set(),
      mediaUrls: new Set(media.map((item) => item.url)),
    };

    products.set(sourceKey, accumulator);
    registerParentLookup(parentLookup, row, sourceKey);
  }

  for (const row of rows) {
    const tokens = typeTokens(row);
    const isVariation = tokens.includes("variation");
    const sourceKey = rowSourceKey(row);

    if (
      !sourceKey ||
      unsupportedProductKind(row) ||
      tokens.includes("variable") ||
      tokens.includes("grouped")
    ) {
      continue;
    }

    const parentKey = isVariation ? parentLookup.get(variationParentKey(row)) : sourceKey;
    const accumulator = parentKey ? products.get(parentKey) : undefined;

    if (!accumulator) {
      addIssue(issues, {
        row: row.rowNumber,
        column: isVariation ? "Parent" : "SKU",
        message: isVariation
          ? "Set Parent to a variable product SKU or id:ID from this CSV."
          : "Add a supported WooCommerce product row.",
      });
      continue;
    }

    const price = parsePrice(row, options.decimalSeparator);

    if (price === undefined) {
      const priceText = row.values["Sale price"]?.trim() || row.values["Regular price"]?.trim();

      addIssue(issues, {
        row: row.rowNumber,
        column: priceText ? "Sale price" : "Regular price",
        message: priceText
          ? "Use a non-negative numeric price."
          : "Add Regular price or Sale price.",
      });
      continue;
    }

    const variantId = externalSourceId(sourceKey);

    if (accumulator.variantIds.has(variantId)) {
      addIssue(issues, {
        row: row.rowNumber,
        column: "SKU",
        message: `Variant ${sourceKey} is duplicated.`,
      });
      continue;
    }

    for (const media of mediaValues(row)) {
      if (!accumulator.mediaUrls.has(media.url)) {
        accumulator.product.media?.push(media);
        accumulator.mediaUrls.add(media.url);
      }
    }

    const variant: DraftProductVariant = {
      id: variantId,
      name: isVariation ? productName(row) || rowSku(row) : accumulator.product.name,
      sku: rowSku(row) || undefined,
      attributes: isVariation ? variantAttributeValues(wooAttributes(row, attributeIndexes)) : [],
      price: {
        currency: options.currencyCode,
        amount: price,
      },
    };

    accumulator.product.variants?.push(variant);
    accumulator.variantIds.add(variantId);
  }

  for (const [sourceKey, accumulator] of products) {
    const variantAttributeNames = new Set(
      (accumulator.product.variants ?? []).flatMap((variant) =>
        (variant.attributes ?? []).map((attribute) => attribute.attribute),
      ),
    );

    accumulator.product.attributes = (accumulator.product.attributes ?? []).filter(
      (attribute) => !variantAttributeNames.has(attribute.attribute),
    );

    if (!accumulator.product.variants?.length) {
      addIssue(issues, {
        row: accumulator.rowNumber,
        column: "Type",
        message: `WooCommerce product ${sourceKey} has no importable priced simple or variation rows.`,
      });
    }
  }

  if (products.size > MAX_IMPORT_PRODUCTS) {
    addIssue(issues, {
      row: 1,
      column: "SKU",
      message: `WooCommerce CSV imports are limited to ${MAX_IMPORT_PRODUCTS} products.`,
    });
  }

  const variantCount = [...products.values()].reduce(
    (count, item) => count + (item.product.variants?.length ?? 0),
    0,
  );

  if (variantCount > MAX_IMPORT_VARIANTS) {
    addIssue(issues, {
      row: 1,
      column: "SKU",
      message: `WooCommerce CSV imports are limited to ${MAX_IMPORT_VARIANTS} variants.`,
    });
  }

  if (issues.length) {
    return err(validationError(issues));
  }

  return ok({
    source: {
      connectorId: WOOCOMMERCE_CSV_CONNECTOR_ID,
      version: WOOCOMMERCE_CSV_VERSION,
      name: fileName ? `WooCommerce CSV: ${fileName}` : "WooCommerce CSV",
      instanceId: sourceInstanceId,
    },
    defaultCountry: "US",
    channel: sourceChannel({
      name: WOOCOMMERCE_CSV_CHANNEL_NAME,
      slug: WOOCOMMERCE_CSV_CHANNEL_SLUG,
      sourceName: fileName || "WooCommerce CSV",
      sourceInstanceId,
      currencyCode: options.currencyCode,
    }),
    categories: [...categories.values()],
    products: [...products.values()].map((item) => item.product),
  });
};
