import { SellerShopConfig } from "../modules/app-configuration/app-config";

export const getMockAddress = (): SellerShopConfig["address"] => {
  return {
    city: "Wrocław",
    cityArea: "",
    companyName: "Saleor",
    country: "Poland",
    countryArea: "Dolnoslaskie",
    firstName: "",
    lastName: "",
    postalCode: "12-123",
    streetAddress1: "Techowa 7",
    streetAddress2: "",
  };
};
