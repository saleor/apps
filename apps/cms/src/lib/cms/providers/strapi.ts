import { StrapiConfig, strapiConfigSchema } from "../config";
import { CmsOperations, CreateOperations, CreateProductResponse, ProductInput } from "../types";
import { createProvider } from "./create";

const strapiFetch = (endpoint: string, config: StrapiConfig, options?: RequestInit) => {
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
      channels: JSON.stringify(input.channels),
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
  return {
    createProduct: async (params) => {
      const body = transformInputToBody(params);
      const response = await strapiFetch("/products", config, {
        method: "POST",
        body: JSON.stringify(body),
      });

      const result = await response.json();

      return transformCreateProductResponse(result);
    },
    updateProduct: ({ id, input }) => {
      const body = transformInputToBody({ input });
      return strapiFetch(`/products/${id}`, config, { method: "PUT", body: JSON.stringify(body) });
    },
    deleteProduct: ({ id }) => {
      return strapiFetch(`/products/${id}`, config, { method: "DELETE" });
    },
  };
};

export default createProvider(strapiOperations, strapiConfigSchema);
