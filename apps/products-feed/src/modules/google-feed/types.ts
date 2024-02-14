export type ProductEntry = {
  id: string;
  title: string;
  sku?: string;
  slug: string;
  variantId: string;
  description?: string;
  link?: string;
  imageUrl?: string;
  additionalImageLinks: string[];
  condition?: "new" | "refurbished" | "used";
  price?: string;
  salePrice?: string;
  googleProductCategory?: string;
  availability: "in_stock" | "out_of_stock" | "preorder" | "backorder";
  category: string;
  material?: string;
  color?: string;
  size?: string;
  brand?: string;
  pattern?: string;
  weight?: string;
  gtin?: string;
};

export type ShopDetailsEntry = {
  title: string;
  storefrontUrl: string;
  description?: string;
};

export type GoogleProxyItem = Record<string, Array<Record<string, string>>>;
