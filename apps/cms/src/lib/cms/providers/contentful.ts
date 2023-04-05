import { v4 as uuidv4 } from "uuid";
import { ContentfulConfig, contentfulConfigSchema } from "../config";
import { logger as pinoLogger } from "../../logger";

import { CreateOperations, ProductResponse, ProductInput } from "../types";
import { createProvider } from "./create";

const contentfulFetch = (endpoint: string, config: ContentfulConfig, options?: RequestInit) => {
  const baseUrl = config.baseUrl || "https://api.contentful.com";
  const token = config.token;

  return fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...options?.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

type ContentfulBody = {
  fields: Record<string, any>;
};

type ContentfulResponse = {
  message?: string;
  fields?: Record<string, any>;
  sys: {
    id: string;
    version?: number;
  };
};

const transformInputToBody = ({
  input,
  locale,
}: {
  input: ProductInput;
  locale: string;
}): ContentfulBody => {
  const body = {
    fields: {
      saleor_id: {
        [locale]: input.saleorId,
      },
      name: {
        [locale]: input.name,
      },
      product_id: {
        [locale]: input.productId,
      },
      product_slug: {
        [locale]: input.productSlug,
      },
      product_name: {
        [locale]: input.productName,
      },
      channels: {
        [locale]: input.channels,
      },
    },
  };
  return body;
};

const transformCreateProductResponse = (
  response: ContentfulResponse,
  input: ProductInput
): ProductResponse => {
  if (response.message) {
    return {
      ok: false,
      error: "Something went wrong!",
    };
  }

  return {
    ok: true,
    data: {
      id: response.sys.id,
      saleorId: input.saleorId,
    },
  };
};

const getEntryEndpoint = ({
  resourceId,
  spaceId,
  environment,
}: {
  resourceId: string;
  spaceId: string;
  environment: string;
}): string => `/spaces/${spaceId}/environments/${environment}/entries/${resourceId}`;

const contentfulOperations: CreateOperations<ContentfulConfig> = (config) => {
  const logger = pinoLogger.child({ cms: "strapi" });

  const { environment, spaceId, contentId, locale } = config;

  const createProductInCMS = async (input: ProductInput): Promise<ContentfulResponse> => {
    // Contentful API does not auto generate resource ID during creation, it has to be provided.
    const resourceId = uuidv4();
    const body = transformInputToBody({ input, locale });
    const endpoint = getEntryEndpoint({
      resourceId,
      environment,
      spaceId,
    });
    const response = await contentfulFetch(endpoint, config, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "X-Contentful-Content-Type": contentId,
      },
    });
    logger.debug("createProduct response", { response });
    logger.debug({ response });
    return await response.json();
  };

  const updateProductInCMS = async (id: string, input: ProductInput) => {
    const body = transformInputToBody({ input, locale });
    const endpoint = getEntryEndpoint({
      resourceId: id,
      environment,
      spaceId,
    });

    const getEntryResponse = await contentfulFetch(endpoint, config, { method: "GET" });
    logger.debug("updateProduct getEntryResponse", { getEntryResponse });
    const entry = await getEntryResponse.json();
    logger.debug("updateProduct entry", { entry });

    const response = await contentfulFetch(endpoint, config, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "X-Contentful-Version": entry.sys.version,
      },
    });
    logger.debug("updateProduct response", { response });
    return await response.json();
  };

  const deleteProductInCMS = async (id: string) => {
    const endpoint = getEntryEndpoint({ resourceId: id, environment, spaceId });

    return await contentfulFetch(endpoint, config, { method: "DELETE" });
  };

  const createBatchProductsInCMS = async (input: ProductInput[]) => {
    // Contentful doesn't support batch creation of items, so we need to create them one by one
    return await Promise.all(
      input.map(async (product) => ({
        response: await createProductInCMS(product),
        input: product,
      }))
    );
  };

  const deleteBatchProductsInCMS = async (ids: string[]) => {
    // Contentful doesn't support batch deletion of items, so we need to delete them one by one
    return await Promise.all(ids.map((id) => deleteProductInCMS(id)));
  };

  return {
    createProduct: async ({ input }) => {
      const result = await createProductInCMS(input);
      logger.debug("createProduct result", { result });

      return transformCreateProductResponse(result, input);
    },
    updateProduct: async ({ id, input }) => {
      const result = await updateProductInCMS(id, input);
      logger.debug("updateProduct result", { result });

      return result;
    },
    deleteProduct: async ({ id }) => {
      const response = await deleteProductInCMS(id);
      logger.debug("deleteProduct response", { response });

      return response;
    },
    createBatchProducts: async ({ input }) => {
      const results = await createBatchProductsInCMS(input);
      logger.debug("createBatchProducts results", { results });

      return results.map((result) => transformCreateProductResponse(result.response, result.input));
    },
    deleteBatchProducts: async ({ ids }) => {
      const results = await deleteBatchProductsInCMS(ids);
      logger.debug("deleteBatchProducts results", { results });
    },
  };
};

export const contentfulProvider = createProvider(contentfulOperations, contentfulConfigSchema);
