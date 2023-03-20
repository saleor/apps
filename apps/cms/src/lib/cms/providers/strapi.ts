import { StrapiConfig, strapiConfigSchema } from "../config";
import { CmsOperations, CreateOperations, CreateProductResponse, ProductInput } from "../types";
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

const transformInputToBody = ({ input }: { input: ProductInput }): StrapiBody => {
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

const transformCreateProductResponse = (response: StrapiResponse): CreateProductResponse => {
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
    },
  };
};

type CreateStrapiOperations = CreateOperations<StrapiConfig>;

export const strapiOperations: CreateStrapiOperations = (config): CmsOperations => {
  const logger = pinoLogger.child({ cms: "strapi" });

  const { contentTypeId } = config;

  return {
    createProduct: async (params) => {
      const body = transformInputToBody(params);
      const response = await strapiFetch(`/${contentTypeId}`, config, {
        method: "POST",
        body: JSON.stringify(body),
      });
      logger.debug("createProduct response", { response });

      const result = await response.json();
      logger.debug("createProduct result", { result });

      return transformCreateProductResponse(result);
    },
    updateProduct: async ({ id, input }) => {
      const body = transformInputToBody({ input });
      const response = await strapiFetch(`/${contentTypeId}/${id}`, config, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      logger.debug("updateProduct response", { response });

      return response;
    },
    deleteProduct: async ({ id }) => {
      const response = await strapiFetch(`/${contentTypeId}/${id}`, config, { method: "DELETE" });
      logger.debug("deleteProduct response", { response });

      return response;
    },
  };
};

export default createProvider(strapiOperations, strapiConfigSchema);
