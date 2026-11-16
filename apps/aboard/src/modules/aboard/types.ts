export type ImportSessionStatus =
  | "configured"
  | "previewed"
  | "running"
  | "completed"
  | "partial"
  | "failed";

export type ImportSessionPreview = {
  source: {
    name: string;
    version: string;
  };
  channel: {
    name: string;
    slug: string;
    currencyCode: string;
  };
  productCount: number;
  variantCount: number;
  exampleProducts: Array<{
    id: string;
    name: string;
    productType?: string;
    variantCount: number;
  }>;
};

export type ImportSessionResult = {
  catalog: {
    sourceName: string;
    products: number;
    variants: number;
    channelSlug: string;
  };
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
  failedProducts: Array<{
    sourceId: string;
    name: string;
    error: string;
  }>;
};

export type ImportSession = {
  id: string;
  connectorId: string;
  connectorVersion?: string;
  status: ImportSessionStatus;
  createdAt: string;
  updatedAt: string;
  preview?: ImportSessionPreview;
  result?: ImportSessionResult;
  error?: string;
};

export type DraftAttributeValue = {
  attribute: string;
  value: string;
};

export type DraftMoney = {
  currency: string;
  amount: number;
};

export type DraftMedia = {
  url: string;
  alt?: string;
};

export type DraftCategory = {
  id: string;
  name: string;
  slug?: string;
  parentId?: string;
};

export type DraftProductVariant = {
  id: string;
  name?: string;
  sku?: string;
  attributes?: DraftAttributeValue[];
  price?: DraftMoney;
};

export type DraftProduct = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  productType?: string;
  categoryId?: string;
  isPublished?: boolean;
  isAvailableForPurchase?: boolean;
  metadata?: DraftAttributeValue[];
  media?: DraftMedia[];
  attributes?: DraftAttributeValue[];
  variants?: DraftProductVariant[];
};

export type SaleorDraftCatalog = {
  source: {
    connectorId: string;
    version: string;
    name: string;
    instanceId: string;
  };
  defaultCountry?: string;
  channel: {
    name: string;
    slug: string;
    currencyCode: string;
  };
  categories?: DraftCategory[];
  products: DraftProduct[];
};
