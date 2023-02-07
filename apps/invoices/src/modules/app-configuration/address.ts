import { SellerShopConfig } from "./app-config";

export const Address = {
  createEmpty(): SellerShopConfig["address"] {
    return {
      city: "",
      cityArea: "",
      companyName: "",
      country: "",
      countryArea: "",
      firstName: "",
      lastName: "",
      postalCode: "",
      streetAddress1: "",
      streetAddress2: "",
    };
  },
};
