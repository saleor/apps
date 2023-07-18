import { SaleorProviderFieldsMappingKey } from "./schemas/saleor-provider-fields-mapping.schema";

export const printSaleorProductFields = (fieldName: SaleorProviderFieldsMappingKey) => {
  switch (fieldName) {
    case "variantName": {
      return "Variant Name";
    }
    case "channels": {
      return "Channels";
    }
    case "productId": {
      return "Product ID";
    }
    case "productName": {
      return "Product Name";
    }
    case "productSlug": {
      return "Product Slug";
    }
    case "variantId": {
      return "Variant ID";
    }
  }
};
