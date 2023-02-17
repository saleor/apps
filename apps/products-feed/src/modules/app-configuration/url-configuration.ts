import { SellerShopConfig } from "./app-config";

export const UrlConfiguration = {
  createEmpty(): SellerShopConfig["urlConfiguration"] {
    return {
      storefrontUrl: "",
      productStorefrontUrl: "",
    };
  },
};
