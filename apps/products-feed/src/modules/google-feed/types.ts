export type ProductEntry = {
  id: string;
  sku?: string;
  name: string;
  slug: string;
  variantId: string;
  description?: string;
  storefrontUrlTemplate?: string;
  imageUrl?: string;
  condition?: "new" | "refurbished" | "used";
  price?: string;
  googleProductCategory: string;
  availability: "in_stock" | "out_of_stock" | "preorder" | "backorder";
  category: string;
};

export type ShopDetailsEntry = {
  title: string;
  storefrontUrl: string;
  description?: string;
};
