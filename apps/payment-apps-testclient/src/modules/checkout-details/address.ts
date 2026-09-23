import { env } from "@/env";

export const getDefaultAddressByCountryCode = () => {
  switch (env.NEXT_PUBLIC_INITIAL_CHECKOUT_COUNTRY_CODE) {
    case "PL": {
      return {
        firstName: "John",
        lastName: "Snow",
        streetAddress1: "Tęczowa 7",
        city: "Wrocław",
        countryArea: "",
        country: "PL",
        postalCode: "53-601",
      } as const;
    }
    case "SE": {
      return {
        firstName: "John",
        lastName: "Snow",
        streetAddress1: "Industrigatan 1",
        city: "Stockholm",
        countryArea: "",
        country: "SE",
        postalCode: "112 46",
      } as const;
    }
    default:
    case "US": {
      return {
        firstName: "John",
        lastName: "Snow",
        streetAddress1: "8559 Lake Avenue",
        city: "New York",
        countryArea: "NY",
        country: "US",
        postalCode: "10001",
      } as const;
    }
  }
};
