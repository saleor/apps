export interface SaleorMoney {
  amount: number;
  currency: string;
}

export interface SaleorMetadata {
  key: string;
  value: string;
}

export interface SaleorMedia {
  id: string;
  url: string;
  alt: string;
  type: string;
}

export interface SaleorAttributeValue {
  id: string;
  name: string;
  slug: string;
  value?: string;
}

export interface SaleorAttribute {
  id: string;
  name: string;
  slug: string;
  inputType: string;
  type?: string;
  choices?: {
    edges: Array<{ node: SaleorAttributeValue }>;
  };
}

export interface SaleorProductAttribute {
  attribute: SaleorAttribute;
  values: SaleorAttributeValue[];
}

export interface SaleorWarehouse {
  id: string;
  name: string;
  slug: string;
}

export interface SaleorStock {
  warehouse: SaleorWarehouse;
  quantity: number;
}

export interface SaleorWeight {
  value: number;
  unit: string;
}

export interface SaleorProductVariant {
  id: string;
  name: string;
  sku: string | null;
  metadata: SaleorMetadata[];
  attributes: SaleorProductAttribute[];
  pricing: {
    price: {
      gross: SaleorMoney;
    } | null;
  } | null;
  stocks: SaleorStock[];
  media: SaleorMedia[];
  weight: SaleorWeight | null;
}

export interface SaleorCategory {
  id: string;
  name: string;
  slug: string;
  parent?: {
    id: string;
    name: string;
  } | null;
}

export interface SaleorCollection {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface SaleorProductType {
  id: string;
  name: string;
  slug: string;
  productAttributes?: SaleorAttribute[];
  variantAttributes?: SaleorAttribute[];
}

export interface SaleorProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  productType: SaleorProductType;
  category: SaleorCategory | null;
  collections: SaleorCollection[];
  attributes: SaleorProductAttribute[];
  metadata: SaleorMetadata[];
  variants: SaleorProductVariant[];
  media: SaleorMedia[];
}

export interface SaleorChannel {
  id: string;
  name: string;
  slug: string;
  currencyCode: string;
  isActive: boolean;
}

export interface SaleorProductsResponse {
  products: {
    edges: Array<{
      cursor: string;
      node: SaleorProduct;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
  };
}

export interface SaleorProductCreateInput {
  name: string;
  slug?: string;
  description?: string;
  productType: string;
  category?: string;
  attributes?: Array<{
    id: string;
    values?: string[];
    dropdown?: { value?: string };
    multiselect?: { values?: string[] };
    plainText?: string;
    richText?: string;
    boolean?: boolean;
    date?: string;
    dateTime?: string;
    file?: string;
    references?: string[];
    numeric?: string;
  }>;
  metadata?: Array<{ key: string; value: string }>;
}

export interface SaleorProductVariantCreateInput {
  product: string;
  name?: string;
  sku?: string;
  trackInventory?: boolean;
  weight?: number;
  attributes?: Array<{
    id: string;
    values?: string[];
    dropdown?: { value?: string };
    multiselect?: { values?: string[] };
  }>;
  stocks?: Array<{
    warehouse: string;
    quantity: number;
  }>;
  metadata?: Array<{ key: string; value: string }>;
}
