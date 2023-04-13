import { StrapiConfig, strapiConfigSchema } from "../config";
import { CreateOperations, ProductResponse, ProductInput } from "../types";
import { createProvider } from "./create";
import { logger as pinoLogger } from "../../logger";

const strapiFetch = async (endpoint: string, config: StrapiConfig, options?: RequestInit) => {
  const { baseUrl, token } = config;

  return fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...options?.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

type StrapiBody = {
  data: Record<string, any> & { saleor_id: string };
};

const transformInputToBody = (input: ProductInput): StrapiBody => {
  const body = {
    data: {
      saleor_id: input.saleorId,
      name: input.name,
      channels: input.channels,
      product_id: input.productId,
      product_name: input.productName,
      product_slug: input.productSlug,
    },
  };
  return body;
};

type StrapiResponse =
  | {
      data: null;
      error: {
        status: number;
        name: string;
        message: string;
        details?: {
          errors: unknown[];
        };
      };
    }
  | {
      data: {
        id: string;
        attributes: Record<string, any>;
        meta: Record<string, any>;
      };
      error: null;
    };

const transformCreateProductResponse = (
  response: StrapiResponse,
  input: ProductInput
): ProductResponse => {
  if (response.error) {
    return {
      ok: false,
      error: "Something went wrong!",
    };
  }

  return {
    ok: true,
    data: {
      id: response.data.id,
      saleorId: input.saleorId,
    },
  };
};

type CreateStrapiOperations = CreateOperations<StrapiConfig>;

export const strapiOperations: CreateStrapiOperations = (config) => {
  const logger = pinoLogger.child({ cms: "strapi" });

  const { contentTypeId } = config;

  const pingCMS = async () => {
    const response = await strapiFetch(`/${contentTypeId}`, config, {
      method: "GET",
    });
    logger.debug({ response }, "pingCMS response");
    return { ok: response.ok };
  };

  const createProductInCMS = async (input: ProductInput): Promise<StrapiResponse> => {
    const body = transformInputToBody(input);
    const response = await strapiFetch(`/${contentTypeId}`, config, {
      method: "POST",
      body: JSON.stringify(body),
    });
    logger.debug({ response }, "createProduct response");
    return await response.json();
  };

  const updateProductInCMS = async (id: string, input: ProductInput) => {
    const body = transformInputToBody(input);
    return await strapiFetch(`/${contentTypeId}/${id}`, config, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  };

  const deleteProductInCMS = async (id: string) => {
    return await strapiFetch(`/${contentTypeId}/${id}`, config, { method: "DELETE" });
  };

  const createBatchProductsInCMS = async (input: ProductInput[]) => {
    // Strapi doesn't support batch creation of items, so we need to create them one by one
    return await Promise.all(
      input.map(async (product) => ({
        response: await createProductInCMS(product),
        input: product,
      }))
    );
  };

  const deleteBatchProductsInCMS = async (ids: string[]) => {
    // Strapi doesn't support batch deletion of items, so we need to delete them one by one
    return await Promise.all(ids.map((id) => deleteProductInCMS(id)));
  };

  return {
    ping: async () => {
      const response = await pingCMS();
      logger.debug({ response }, "ping response");

      return response;
    },
    createProduct: async ({ input }) => {
      const result = await createProductInCMS(input);
      logger.debug({ result }, "createProduct result");

      return transformCreateProductResponse(result, input);
    },
    updateProduct: async ({ id, input }) => {
      const response = await updateProductInCMS(id, input);
      logger.debug({ response }, "updateProduct response");

      return response;
    },
    deleteProduct: async ({ id }) => {
      const response = await deleteProductInCMS(id);
      logger.debug({ response }, "deleteProduct response");

      return response;
    },
    createBatchProducts: async ({ input }) => {
      const results = await createBatchProductsInCMS(input);
      logger.debug({ results }, "createBatchProducts results");

      return results.map((result) => transformCreateProductResponse(result.response, result.input));
    },
    deleteBatchProducts: async ({ ids }) => {
      const responses = await deleteBatchProductsInCMS(ids);
      logger.debug({ responses }, "deleteBatchProducts responses");

      return responses;
    },
  };
};

export const strapiProvider = createProvider(strapiOperations, strapiConfigSchema);
