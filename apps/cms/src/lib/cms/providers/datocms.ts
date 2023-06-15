import { createProvider } from "./create";
import { CreateOperations, ProductInput, ProductResponse } from "../types";

import { ApiError, buildClient, SimpleSchemaTypes } from "@datocms/cma-client-node";
import { DatocmsConfig, datocmsConfigSchema } from "../config";
import { createLogger } from "@saleor/apps-shared";

const datocmsClient = (config: DatocmsConfig, options?: RequestInit) => {
  const { baseUrl, token, environment } = config;

  const clientEnvironment = environment ? { environment } : {};
  const clientBaseUrl = baseUrl ? { baseUrl } : {};

  return buildClient({
    apiToken: token,
    ...clientEnvironment,
    ...clientBaseUrl,
  });
};

const transformResponseError = (error: unknown): ProductResponse => {
  if (error instanceof ApiError) {
    return {
      ok: false,
      error: error.message,
    };
  } else {
    return {
      ok: false,
      error: "Something went wrong!",
    };
  }
};

const transformResponseItem = (
  item: SimpleSchemaTypes.Item,
  input: ProductInput
): ProductResponse => {
  return {
    ok: true,
    data: {
      id: item.id,
      saleorId: input.saleorId,
    },
  };
};

const datocmsOperations: CreateOperations<DatocmsConfig> = (config) => {
  const logger = createLogger({ cms: "strapi" });

  const client = datocmsClient(config);

  const pingCMS = async () => client.users.findMe();

  const createProductInCMS = async (input: ProductInput) =>
    client.items.create({
      item_type: {
        id: String(config.itemTypeId),
        type: "item_type",
      },
      saleor_id: input.saleorId,
      name: input.name,
      channels: JSON.stringify(input.channels),
      product_id: input.productId,
      product_name: input.productName,
      product_slug: input.productSlug,
    });

  const updateProductInCMS = async (id: string, input: ProductInput) =>
    client.items.update(id, {
      saleor_id: input.saleorId,
      name: input.name,
      channels: JSON.stringify(input.channels),
      product_id: input.productId,
      product_name: input.productName,
      product_slug: input.productSlug,
    });

  const deleteProductInCMS = async (id: string) => client.items.destroy(id);

  const createBatchProductsInCMS = async (input: ProductInput[]) =>
    // DatoCMS doesn't support batch creation of items, so we need to create them one by one
    Promise.all(
      input.map(async (item) => ({
        id: await createProductInCMS(item),
        input: item,
      }))
    );

  const deleteBatchProductsInCMS = async (ids: string[]) =>
    client.items.bulkDestroy({
      items: ids.map((id) => ({ id, type: "item" })),
    });

  return {
    ping: async () => {
      try {
        const response = await pingCMS();

        logger.debug({ response }, "ping response");

        if (!response.id) {
          throw new Error();
        }

        return { ok: true };
      } catch (error) {
        return { ok: false };
      }
    },
    createProduct: async ({ input }) => {
      try {
        const item = await createProductInCMS(input);

        logger.trace("createProduct success");

        return transformResponseItem(item, input);
      } catch (error) {
        return transformResponseError(error);
      }
    },
    updateProduct: async ({ id, input }) => {
      const item = await updateProductInCMS(id, input);

      logger.trace("updateProduct success");
    },
    deleteProduct: async ({ id }) => {
      const item = await deleteProductInCMS(id);

      logger.trace("deleteProduct success");
    },
    createBatchProducts: async ({ input }) => {
      const items = await createBatchProductsInCMS(input);

      logger.trace("createBatchProducts success");

      return items.map((item) => transformResponseItem(item.id, item.input));
    },
    deleteBatchProducts: async ({ ids }) => {
      const items = await deleteBatchProductsInCMS(ids);

      logger.trace("deleteBatchProducts success");
    },
  };
};

export const datoCmsProvider = createProvider(datocmsOperations, datocmsConfigSchema);
