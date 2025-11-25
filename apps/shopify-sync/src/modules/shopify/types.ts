export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  id: string;
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

export interface ShopifyMetafield {
  id: string;
  namespace: string;
  key: string;
  value: string;
  type: string;
}

export interface ShopifyProductOption {
  id: string;
  name: string;
  position: number;
  values: string[];
}

export interface ShopifySelectedOption {
  name: string;
  value: string;
}

export interface ShopifyInventoryItem {
  id: string;
  sku: string | null;
  tracked: boolean;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  sku: string | null;
  barcode: string | null;
  price: string;
  compareAtPrice: string | null;
  weight: number | null;
  weightUnit: string | null;
  inventoryQuantity: number | null;
  inventoryItem: ShopifyInventoryItem | null;
  selectedOptions: ShopifySelectedOption[];
  image: ShopifyImage | null;
  metafields: {
    edges: Array<{ node: ShopifyMetafield }>;
  };
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  status: "ACTIVE" | "ARCHIVED" | "DRAFT";
  tags: string[];
  options: ShopifyProductOption[];
  images: {
    edges: Array<{ node: ShopifyImage }>;
  };
  variants: {
    edges: Array<{ node: ShopifyProductVariant }>;
  };
  metafields: {
    edges: Array<{ node: ShopifyMetafield }>;
  };
  collections: {
    edges: Array<{ node: ShopifyCollection }>;
  };
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: ShopifyImage | null;
}

export interface ShopifyProductsResponse {
  products: {
    edges: Array<{
      node: ShopifyProduct;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
  };
}

export interface ShopifyCollectionsResponse {
  collections: {
    edges: Array<{
      node: ShopifyCollection;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

export interface ShopifyProductCreateInput {
  title: string;
  handle?: string;
  descriptionHtml?: string;
  vendor?: string;
  productType?: string;
  status?: "ACTIVE" | "ARCHIVED" | "DRAFT";
  tags?: string[];
  options?: string[];
  metafields?: Array<{
    namespace: string;
    key: string;
    value: string;
    type: string;
  }>;
}

export interface ShopifyProductVariantInput {
  price?: string;
  compareAtPrice?: string;
  sku?: string;
  barcode?: string;
  weight?: number;
  weightUnit?: string;
  options?: string[];
  metafields?: Array<{
    namespace: string;
    key: string;
    value: string;
    type: string;
  }>;
}
