import { ShopAddress } from "../modules/shop-info/shop-address";

export const getMockAddress = (): ShopAddress => {
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
