import { SellerShopConfig } from "../modules/app-configuration/schema-v1/app-config-v1";

export const getMockAddress = (): SellerShopConfig["address"] => {
  return {
    city: "Wrocław",
    cityArea: "",
    companyName: "Saleor",
    country: "Poland",
    countryArea: "Dolnoslaskie",
    postalCode: "12-123",
    streetAddress1: "Techowa 7",
    streetAddress2: "",
  };
};
