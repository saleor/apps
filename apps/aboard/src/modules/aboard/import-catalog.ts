import { BaseError } from "@saleor/errors";
import { err, ok, Result } from "neverthrow";

import {
  AttributeByExternalReferenceDocument,
  BulkCreateImportedProductsDocument,
  CategoryBySlugDocument,
  type CountryCode,
  CreateImportAttributeDocument,
  CreateImportCategoryDocument,
  CreateImportChannelDocument,
  CreateImportProductTypeDocument,
  ExistingImportChannelDocument,
  type ProductBulkCreateInput,
  ProductByExternalReferenceDocument,
  ProductTypeBySlugDocument,
  type ProductTypeBySlugQuery,
  UpdateImportProductTypeDocument,
} from "@/generated/graphql";

import { type CatalogSizeError, checkCatalogSize } from "./catalog-limits";
import { boundedMap } from "./concurrency";
import { hash } from "./hash";
import { type SaleorImportClient, type SaleorImportClientError } from "./saleor-import-client";
import { type DraftCategory, type DraftProduct, type SaleorDraftCatalog } from "./types";
import { type DraftCatalogValidationError, validateDraftCatalog } from "./validate-draft-catalog";

export const CatalogImportError = {
  /**
   * Saleor already has an object with Aboard's slug or external reference, but Aboard didn't
   * create it for this source. Importing would overwrite merchant data, so the import stops.
   */
  ConflictError: BaseError.subclass("CatalogImport.ConflictError", {
    props: { _brand: "CatalogImport.ConflictError" as const },
  }),
  MutationError: BaseError.subclass("CatalogImport.MutationError", {
    props: { _brand: "CatalogImport.MutationError" as const },
  }),
};

export type CatalogImportError =
  | InstanceType<typeof CatalogImportError.ConflictError | typeof CatalogImportError.MutationError>
  | SaleorImportClientError
  | CatalogSizeError
  | DraftCatalogValidationError;

export type SaleorCatalogImportResult = {
  channel: {
    id: string;
    created: boolean;
  };
  createdAttributes: number;
  createdProductTypes: number;
  createdProducts: number;
  createdVariants: number;
  skippedProducts: number;
  errors: string[];
  failedProducts: Array<{ sourceId: string; name: string; error: string }>;
};

type SaleorMutationError = {
  readonly field?: string | null;
  readonly path?: string | null;
  readonly message?: string | null;
  readonly code?: string | null;
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

const DEFAULT_IMPORT_CATEGORY_ID = "category:imported-products";
const DEFAULT_IMPORT_CATEGORY_SLUG = "imported-products";
const SALEOR_WRITE_CONCURRENCY = 5;
const SALEOR_READ_CONCURRENCY = 10;

const errorMessages = (errors: ReadonlyArray<SaleorMutationError>) =>
  errors
    .map((error) => {
      const location = error.field ?? error.path;
      const message = [error.message, error.code ? `(${error.code})` : undefined]
        .filter(Boolean)
        .join(" ");

      return location ? `${location}: ${message}` : message;
    })
    .filter((message): message is string => Boolean(message))
    .join("; ");

const mutationError = (errors: ReadonlyArray<SaleorMutationError>, fallback: string) =>
  new CatalogImportError.MutationError(errorMessages(errors) || fallback);

const richTextDescription = (html: string | undefined) =>
  JSON.stringify({
    time: Date.now(),
    blocks: html
      ? [
          {
            id: "imported-description",
            type: "paragraph",
            data: { text: html },
          },
        ]
      : [],
    version: "2.29.0",
  });

const managedPrivateMetadata = (
  catalog: SaleorDraftCatalog,
  extra: Array<{ key: string; value: string }> = [],
) => [
  { key: "aboard.managed", value: "true" },
  { key: "aboard.connectorId", value: catalog.source.connectorId },
  { key: "aboard.connectorVersion", value: catalog.source.version },
  { key: "aboard.sourceName", value: catalog.source.name },
  { key: "aboard.sourceInstanceId", value: catalog.source.instanceId },
  { key: "aboard.lastImportedAt", value: new Date().toISOString() },
  ...extra,
];

const ensureChannel = async (
  client: SaleorImportClient,
  catalog: SaleorDraftCatalog,
): Promise<Result<{ id: string; created: boolean }, CatalogImportError>> => {
  const existing = await client.query(ExistingImportChannelDocument, {});

  if (existing.isErr()) {
    return err(existing.error);
  }

  const channel = existing.value.channels?.find((item) => item.slug === catalog.channel.slug);

  if (channel) {
    if (channel.privateMetafield !== "true") {
      return err(
        new CatalogImportError.ConflictError(
          `Channel slug ${catalog.channel.slug} already exists but is not managed by Aboard.`,
        ),
      );
    }

    if (channel.currencyCode !== catalog.channel.currencyCode) {
      return err(
        new CatalogImportError.ConflictError(
          `Existing ${catalog.channel.slug} channel uses ${channel.currencyCode}, but import uses ${catalog.channel.currencyCode}.`,
        ),
      );
    }

    return ok({ id: channel.id, created: false });
  }

  const created = await client.mutation(CreateImportChannelDocument, {
    input: {
      name: catalog.channel.name,
      slug: catalog.channel.slug,
      currencyCode: catalog.channel.currencyCode,
      defaultCountry: (catalog.defaultCountry ?? "US") as CountryCode,
      isActive: true,
      privateMetadata: managedPrivateMetadata(catalog, [{ key: "aboard.channel", value: "true" }]),
    },
  });

  if (created.isErr()) {
    return err(created.error);
  }

  const payload = created.value.channelCreate;

  if (!payload?.channel || payload.errors.length) {
    return err(mutationError(payload?.errors ?? [], "Import channel was not created."));
  }

  return ok({ id: payload.channel.id, created: true });
};

type AttributeScope = "product" | "variant";

type AttributeIds = {
  productAttributeIds: Map<string, string>;
  variantAttributeIds: Map<string, string>;
};

const collectAttributeValues = (products: DraftProduct[], scope: AttributeScope) => {
  const values = new Map<string, Set<string>>();

  for (const product of products) {
    const attributes =
      scope === "product"
        ? product.attributes ?? []
        : (product.variants ?? []).flatMap((variant) => variant.attributes ?? []);

    for (const attribute of attributes) {
      if (!values.has(attribute.attribute)) {
        values.set(attribute.attribute, new Set());
      }

      values.get(attribute.attribute)?.add(attribute.value);
    }
  }

  return values;
};

const ensureAttribute = async (
  client: SaleorImportClient,
  { name, values, scope }: { name: string; values: Set<string>; scope: AttributeScope },
): Promise<Result<{ name: string; id: string; created: boolean }, CatalogImportError>> => {
  const externalReference =
    scope === "variant"
      ? `aboard:attribute:${slugify(name)}`
      : `aboard:product-attribute:${slugify(name)}`;
  const existing = await client.query(AttributeByExternalReferenceDocument, {
    externalReference,
  });

  if (existing.isErr()) {
    return err(existing.error);
  }

  if (existing.value.attribute) {
    return ok({ name, id: existing.value.attribute.id, created: false });
  }

  const created = await client.mutation(CreateImportAttributeDocument, {
    input: {
      name,
      slug: scope === "variant" ? `aboard-${slugify(name)}` : `aboard-product-${slugify(name)}`,
      type: "PRODUCT_TYPE",
      inputType: "DROPDOWN",
      isVariantOnly: scope === "variant",
      valueRequired: false,
      externalReference,
      values: [...values].map((value) => ({ name: value })),
    },
  });

  if (created.isErr()) {
    return err(created.error);
  }

  const payload = created.value.attributeCreate;

  if (!payload?.attribute || payload.errors.length) {
    return err(mutationError(payload?.errors ?? [], `Attribute ${name} was not created.`));
  }

  return ok({ name, id: payload.attribute.id, created: true });
};

const ensureAttributes = async (
  client: SaleorImportClient,
  catalog: SaleorDraftCatalog,
): Promise<Result<AttributeIds & { created: number }, CatalogImportError>> => {
  const productValues = collectAttributeValues(catalog.products, "product");
  const variantValues = collectAttributeValues(catalog.products, "variant");
  const productResults = Result.combine(
    await boundedMap([...productValues.entries()], SALEOR_WRITE_CONCURRENCY, ([name, values]) =>
      ensureAttribute(client, { name, values, scope: "product" }),
    ),
  );

  if (productResults.isErr()) {
    return err(productResults.error);
  }

  const variantResults = Result.combine(
    await boundedMap([...variantValues.entries()], SALEOR_WRITE_CONCURRENCY, ([name, values]) =>
      ensureAttribute(client, { name, values, scope: "variant" }),
    ),
  );

  if (variantResults.isErr()) {
    return err(variantResults.error);
  }

  return ok({
    productAttributeIds: new Map(productResults.value.map((result) => [result.name, result.id])),
    variantAttributeIds: new Map(variantResults.value.map((result) => [result.name, result.id])),
    created: [...productResults.value, ...variantResults.value].filter((result) => result.created)
      .length,
  });
};

const productsByType = (products: DraftProduct[]) => {
  const byType = new Map<string, DraftProduct[]>();

  for (const product of products) {
    const typeName = product.productType?.trim() || "Default";

    byType.set(typeName, [...(byType.get(typeName) ?? []), product]);
  }

  return byType;
};

/**
 * Reused product types keep their attributes; newly seen ones are appended so imported products
 * can set them.
 */
const addMissingProductTypeAttributes = async (
  client: SaleorImportClient,
  {
    typeName,
    productType,
    productAttributeIds,
    variantAttributeIds,
  }: {
    typeName: string;
    productType: NonNullable<
      NonNullable<ProductTypeBySlugQuery["productTypes"]>["edges"][number]["node"]
    >;
    productAttributeIds: string[];
    variantAttributeIds: string[];
  },
): Promise<Result<void, CatalogImportError>> => {
  const currentProductAttributeIds = (productType.productAttributes ?? []).map(
    (attribute) => attribute.id,
  );
  const currentVariantAttributeIds = (productType.assignedVariantAttributes ?? []).map(
    (assigned) => assigned.attribute.id,
  );
  const nextProductAttributeIds = [
    ...new Set([...currentProductAttributeIds, ...productAttributeIds]),
  ];
  const nextVariantAttributeIds = [
    ...new Set([...currentVariantAttributeIds, ...variantAttributeIds]),
  ];

  if (
    nextProductAttributeIds.length === currentProductAttributeIds.length &&
    nextVariantAttributeIds.length === currentVariantAttributeIds.length
  ) {
    return ok(undefined);
  }

  const updated = await client.mutation(UpdateImportProductTypeDocument, {
    id: productType.id,
    input: {
      productAttributes: nextProductAttributeIds,
      variantAttributes: nextVariantAttributeIds,
    },
  });

  if (updated.isErr()) {
    return err(updated.error);
  }

  const payload = updated.value.productTypeUpdate;

  if (!payload?.productType || payload.errors.length) {
    return err(mutationError(payload?.errors ?? [], `Product type ${typeName} was not updated.`));
  }

  return ok(undefined);
};

const ensureProductType = async (
  client: SaleorImportClient,
  {
    typeName,
    products,
    attributeIds,
  }: { typeName: string; products: DraftProduct[]; attributeIds: AttributeIds },
): Promise<Result<{ typeName: string; id: string; created: boolean }, CatalogImportError>> => {
  const slug = `aboard-${slugify(typeName)}`;
  const productAttributeIds = [
    ...new Set(
      products.flatMap((product) =>
        (product.attributes ?? [])
          .map((attribute) => attributeIds.productAttributeIds.get(attribute.attribute))
          .filter((id): id is string => id !== undefined),
      ),
    ),
  ];
  const variantAttributeIds = [
    ...new Set(
      products.flatMap((product) =>
        (product.variants ?? []).flatMap((variant) =>
          (variant.attributes ?? [])
            .map((attribute) => attributeIds.variantAttributeIds.get(attribute.attribute))
            .filter((id): id is string => id !== undefined),
        ),
      ),
    ),
  ];
  const existing = await client.query(ProductTypeBySlugDocument, { slug });

  if (existing.isErr()) {
    return err(existing.error);
  }

  const existingProductType = existing.value.productTypes?.edges[0]?.node;

  if (existingProductType) {
    const synced = await addMissingProductTypeAttributes(client, {
      typeName,
      productType: existingProductType,
      productAttributeIds,
      variantAttributeIds,
    });

    return synced.map(() => ({ typeName, id: existingProductType.id, created: false }));
  }

  const created = await client.mutation(CreateImportProductTypeDocument, {
    input: {
      name: typeName,
      slug,
      kind: "NORMAL",
      isDigital: false,
      isShippingRequired: true,
      productAttributes: productAttributeIds,
      variantAttributes: variantAttributeIds,
    },
  });

  if (created.isErr()) {
    return err(created.error);
  }

  const payload = created.value.productTypeCreate;

  if (!payload?.productType || payload.errors.length) {
    return err(mutationError(payload?.errors ?? [], `Product type ${typeName} was not created.`));
  }

  return ok({ typeName, id: payload.productType.id, created: true });
};

const ensureProductTypes = async (
  client: SaleorImportClient,
  catalog: SaleorDraftCatalog,
  attributeIds: AttributeIds,
): Promise<
  Result<{ productTypeIds: Map<string, string>; created: number }, CatalogImportError>
> => {
  const results = Result.combine(
    await boundedMap(
      [...productsByType(catalog.products).entries()],
      SALEOR_WRITE_CONCURRENCY,
      ([typeName, products]) => ensureProductType(client, { typeName, products, attributeIds }),
    ),
  );

  if (results.isErr()) {
    return err(results.error);
  }

  return ok({
    productTypeIds: new Map(results.value.map((result) => [result.typeName, result.id])),
    created: results.value.filter((result) => result.created).length,
  });
};

const findCategoryBySlugAndParent = async (
  client: SaleorImportClient,
  slug: string,
  parentId: string | undefined,
) => {
  const existing = await client.query(CategoryBySlugDocument, { slug });

  return existing.map((data) =>
    (data.categories?.edges ?? [])
      .map((edge) => edge.node)
      .find((category) => (category.parent?.id ?? undefined) === parentId),
  );
};

const createCategory = async (
  client: SaleorImportClient,
  {
    catalog,
    category,
    parentId,
  }: { catalog: SaleorDraftCatalog; category: DraftCategory; parentId: string | undefined },
): Promise<Result<string, CatalogImportError>> => {
  const created = await client.mutation(CreateImportCategoryDocument, {
    input: {
      name: category.name,
      slug: category.slug || slugify(category.name),
      privateMetadata: managedPrivateMetadata(catalog, [
        { key: "aboard.category", value: "true" },
        { key: "aboard.sourceId", value: category.id },
      ]),
    },
    parent: parentId,
  });

  if (created.isErr()) {
    return err(created.error);
  }

  const payload = created.value.categoryCreate;

  if (!payload?.category || payload.errors.length) {
    return err(mutationError(payload?.errors ?? [], `Category ${category.name} was not created.`));
  }

  return ok(payload.category.id);
};

const ensureCategories = async (
  client: SaleorImportClient,
  catalog: SaleorDraftCatalog,
): Promise<Result<Map<string, string>, CatalogImportError>> => {
  const categoryIds = new Map<string, string>();

  // Sequential on purpose: children need the Saleor ID of their parent.
  for (const category of catalog.categories ?? []) {
    const parentId = category.parentId ? categoryIds.get(category.parentId) : undefined;
    const slug = category.slug || slugify(category.name);
    const existing = await findCategoryBySlugAndParent(client, slug, parentId);

    if (existing.isErr()) {
      return err(existing.error);
    }

    if (existing.value) {
      if (
        category.id === DEFAULT_IMPORT_CATEGORY_ID &&
        slug === DEFAULT_IMPORT_CATEGORY_SLUG &&
        !parentId &&
        existing.value.privateMetafield !== "true"
      ) {
        return err(
          new CatalogImportError.ConflictError(
            "Category slug imported-products already exists but is not managed by Aboard.",
          ),
        );
      }

      categoryIds.set(category.id, existing.value.id);
      continue;
    }

    const created = await createCategory(client, { catalog, category, parentId });

    if (created.isErr()) {
      return err(created.error);
    }

    categoryIds.set(category.id, created.value);
  }

  return ok(categoryIds);
};

const scopedExternalReference = (
  catalog: SaleorDraftCatalog,
  kind: "product" | "variant",
  sourceId: string,
) => {
  const namespace = hash(`${catalog.source.connectorId}\0${catalog.source.instanceId}`).slice(
    0,
    20,
  );
  const id = sourceId.length <= 160 ? sourceId : hash(sourceId);

  return `aboard:${kind}:${namespace}:${id}`;
};

const productIsAlreadyImported = async (
  client: SaleorImportClient,
  catalog: SaleorDraftCatalog,
  product: DraftProduct,
): Promise<Result<boolean, CatalogImportError>> => {
  const externalReference = scopedExternalReference(catalog, "product", product.id);
  const existing = await client.query(ProductByExternalReferenceDocument, { externalReference });

  if (existing.isErr()) {
    return err(existing.error);
  }

  const existingProduct = existing.value.product;

  if (!existingProduct) {
    return ok(false);
  }

  if (
    existingProduct.managed !== "true" ||
    existingProduct.connectorId !== catalog.source.connectorId ||
    existingProduct.sourceInstanceId !== catalog.source.instanceId
  ) {
    return err(
      new CatalogImportError.ConflictError(
        `${product.name}: external reference ${externalReference} is already used by a product that is not managed by this Aboard source.`,
      ),
    );
  }

  return ok(true);
};

const toAttributeInputs = (
  attributes: DraftProduct["attributes"],
  attributeIdsByName: Map<string, string>,
) =>
  (attributes ?? []).flatMap((attribute) => {
    const id = attributeIdsByName.get(attribute.attribute);

    return id ? [{ id, dropdown: { value: attribute.value } }] : [];
  });

const buildProductInput = ({
  catalog,
  product,
  productTypeId,
  channelId,
  attributeIds,
  categoryIds,
}: {
  catalog: SaleorDraftCatalog;
  product: DraftProduct;
  productTypeId: string;
  channelId: string;
  attributeIds: AttributeIds;
  categoryIds: Map<string, string>;
}): ProductBulkCreateInput => ({
  name: product.name,
  slug: product.slug || slugify(product.name),
  description: richTextDescription(product.description),
  productType: productTypeId,
  category: product.categoryId ? categoryIds.get(product.categoryId) : undefined,
  externalReference: scopedExternalReference(catalog, "product", product.id),
  privateMetadata: managedPrivateMetadata(catalog, [{ key: "aboard.sourceId", value: product.id }]),
  metadata: product.metadata?.map((item) => ({ key: item.attribute, value: item.value })) ?? [],
  attributes: toAttributeInputs(product.attributes, attributeIds.productAttributeIds),
  channelListings: [
    {
      channelId,
      isPublished: product.isPublished ?? true,
      isAvailableForPurchase: product.isAvailableForPurchase ?? product.isPublished ?? true,
      visibleInListings: true,
    },
  ],
  media: product.media?.map((item) => ({
    mediaUrl: item.url,
    ...(item.alt ? { alt: item.alt } : {}),
  })),
  variants: (product.variants ?? []).map((variant) => ({
    name: variant.name ?? product.name,
    sku: variant.sku,
    externalReference: scopedExternalReference(catalog, "variant", variant.id),
    privateMetadata: managedPrivateMetadata(catalog, [
      { key: "aboard.sourceId", value: variant.id },
      { key: "aboard.sourceProductId", value: product.id },
    ]),
    attributes: toAttributeInputs(variant.attributes, attributeIds.variantAttributeIds),
    channelListings:
      variant.price?.currency === catalog.channel.currencyCode
        ? [{ channelId, price: variant.price.amount }]
        : [],
  })),
});

const BULK_CREATE_BATCH_SIZE = 50;

type ProductImportSummary = Pick<
  SaleorCatalogImportResult,
  "createdProducts" | "createdVariants" | "skippedProducts" | "errors" | "failedProducts"
>;

/**
 * Per-product failures are reported in the summary so one bad row doesn't stop the rest of the
 * catalog. Only request failures and ownership conflicts stop the import.
 */
const importProducts = async (
  client: SaleorImportClient,
  catalog: SaleorDraftCatalog,
  {
    channelId,
    attributeIds,
    productTypeIds,
    categoryIds,
  }: {
    channelId: string;
    attributeIds: AttributeIds;
    productTypeIds: Map<string, string>;
    categoryIds: Map<string, string>;
  },
): Promise<Result<ProductImportSummary, CatalogImportError>> => {
  const result: ProductImportSummary = {
    createdProducts: 0,
    createdVariants: 0,
    skippedProducts: 0,
    errors: [],
    failedProducts: [],
  };
  const existing = Result.combine(
    await boundedMap(catalog.products, SALEOR_READ_CONCURRENCY, async (product) =>
      (await productIsAlreadyImported(client, catalog, product)).map((exists) => ({
        id: product.id,
        exists,
      })),
    ),
  );

  if (existing.isErr()) {
    return err(existing.error);
  }

  const existingIds = new Set(existing.value.filter((item) => item.exists).map((item) => item.id));

  result.skippedProducts = existingIds.size;

  const toCreate = catalog.products.filter((product) => !existingIds.has(product.id));

  for (let index = 0; index < toCreate.length; index += BULK_CREATE_BATCH_SIZE) {
    const batch = toCreate.slice(index, index + BULK_CREATE_BATCH_SIZE);
    const candidates = batch.flatMap((product) => {
      const productTypeId = productTypeIds.get(product.productType?.trim() || "Default");

      if (!productTypeId) {
        const error = `missing product type ${product.productType ?? "Default"}.`;

        result.errors.push(`${product.name}: ${error}`);
        result.failedProducts.push({ sourceId: product.id, name: product.name, error });

        return [];
      }

      return [
        {
          source: product,
          input: buildProductInput({
            catalog,
            product,
            productTypeId,
            channelId,
            attributeIds,
            categoryIds,
          }),
        },
      ];
    });

    if (!candidates.length) {
      continue;
    }

    const created = await client.mutation(BulkCreateImportedProductsDocument, {
      products: candidates.map((candidate) => candidate.input),
    });

    if (created.isErr()) {
      return err(created.error);
    }

    const payload = created.value.productBulkCreate;

    if (!payload) {
      return err(new CatalogImportError.MutationError("Products were not created."));
    }

    if (payload.errors.length) {
      result.errors.push(errorMessages(payload.errors));
    }

    payload.results.forEach((row, resultIndex) => {
      const sourceProduct = candidates[resultIndex].source;

      if (row.errors?.length || !row.product) {
        const error = errorMessages(row.errors ?? []) || "product was not created.";

        result.errors.push(`${sourceProduct.name}: ${error}`);
        result.failedProducts.push({
          sourceId: sourceProduct.id,
          name: sourceProduct.name,
          error,
        });

        return;
      }

      result.createdProducts += 1;
      result.createdVariants += row.product.productVariants?.totalCount ?? 0;
    });
  }

  return ok(result);
};

export const importDraftCatalogToSaleor = async (
  client: SaleorImportClient,
  catalog: SaleorDraftCatalog,
): Promise<Result<SaleorCatalogImportResult, CatalogImportError>> => {
  const size = checkCatalogSize(
    catalog.products.length,
    catalog.products.reduce((count, product) => count + (product.variants?.length ?? 0), 0),
  );

  if (size.isErr()) {
    return err(size.error);
  }

  const valid = validateDraftCatalog(catalog);

  if (valid.isErr()) {
    return err(valid.error);
  }

  const channel = await ensureChannel(client, catalog);

  if (channel.isErr()) {
    return err(channel.error);
  }

  const attributes = await ensureAttributes(client, catalog);

  if (attributes.isErr()) {
    return err(attributes.error);
  }

  const attributeIds = {
    productAttributeIds: attributes.value.productAttributeIds,
    variantAttributeIds: attributes.value.variantAttributeIds,
  };
  const productTypes = await ensureProductTypes(client, catalog, attributeIds);

  if (productTypes.isErr()) {
    return err(productTypes.error);
  }

  const categoryIds = await ensureCategories(client, catalog);

  if (categoryIds.isErr()) {
    return err(categoryIds.error);
  }

  const products = await importProducts(client, catalog, {
    channelId: channel.value.id,
    attributeIds,
    productTypeIds: productTypes.value.productTypeIds,
    categoryIds: categoryIds.value,
  });

  if (products.isErr()) {
    return err(products.error);
  }

  return ok({
    channel: channel.value,
    createdAttributes: attributes.value.created,
    createdProductTypes: productTypes.value.created,
    ...products.value,
  });
};
