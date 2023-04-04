import { createProvider } from "./create";
import { CmsOperations, CreateOperations, ProductResponse } from "../types";
import { logger as pinoLogger } from "../../logger";

import { ApiError, buildClient, SimpleSchemaTypes } from "@datocms/cma-client-node";
import { DatocmsConfig, datocmsConfigSchema } from "../config";

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

const transformResponseItem = (item: SimpleSchemaTypes.Item): ProductResponse => {
  return {
    ok: true,
    data: {
      id: item.id,
    },
  };
};

const datocmsOperations: CreateOperations<DatocmsConfig> = (config) => {
  const logger = pinoLogger.child({ cms: "strapi" });

  return {
    createProduct: async ({ input }) => {
      const client = datocmsClient(config);

      try {
        const item = await client.items.create({
          item_type: {
            id: config.itemTypeId,
            type: "item_type",
          },
          saleor_id: input.saleorId,
          name: input.name,
          channels: JSON.stringify(input.channels),
          product_id: input.productId,
          product_name: input.productName,
          product_slug: input.productSlug,
        });
        logger.debug("createProduct response", { item });

        return transformResponseItem(item);
      } catch (error) {
        return transformResponseError(error);
      }
    },
    updateProduct: async ({ id, input }) => {
      const client = datocmsClient(config);

      const item = await client.items.update(id, {
        saleor_id: input.saleorId,
        name: input.name,
        channels: JSON.stringify(input.channels),
        product_id: input.productId,
        product_name: input.productName,
        product_slug: input.productSlug,
      });
      logger.debug("updateProduct response", { item });
    },
    deleteProduct: async ({ id }) => {
      const client = datocmsClient(config);

      const item = await client.items.destroy(id);
      logger.debug("deleteProduct response", { item });
    },
    createBatchProducts: async ({ input }) => {
      // todo: implement function

      return [];
    },
    deleteBatchProducts: async ({ ids }) => {
      // todo: implement function

      return [];
    },
  };
};

export const datoCmsProvider = createProvider(datocmsOperations, datocmsConfigSchema);
