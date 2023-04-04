import { v4 as uuidv4 } from "uuid";
import { ContentfulConfig, contentfulConfigSchema } from "../config";
import { logger as pinoLogger } from "../../logger";

import { CreateOperations, CreateProductResponse, ProductInput } from "../types";
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

const transformCreateProductResponse = (response: ContentfulResponse): CreateProductResponse => {
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

  return {
    createProduct: async (params) => {
      // Contentful API does not auto generate resource ID during creation, it has to be provided.
      const resourceId = uuidv4();
      const body = transformInputToBody({ input: params.input, locale });
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
      const result = await response.json();
      logger.debug("createProduct result", { result });

      return transformCreateProductResponse(result);
    },
    updateProduct: async ({ id, input }) => {
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
      const result = await response.json();
      logger.debug("updateProduct result", { result });

      return result;
    },
    deleteProduct: async ({ id }) => {
      const endpoint = getEntryEndpoint({ resourceId: id, environment, spaceId });

      const response = await contentfulFetch(endpoint, config, { method: "DELETE" });
      logger.debug("deleteProduct response", { response });

      return response;
    },
  };
};

export const contentfulProvider = createProvider(contentfulOperations, contentfulConfigSchema);
