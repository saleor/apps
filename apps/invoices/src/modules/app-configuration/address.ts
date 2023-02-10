export type SellerAddress = {
  companyName: string;
  cityArea: string;
  countryArea: string;
  streetAddress1: string;
  streetAddress2: string;
  postalCode: string;
  city: string;
  country: string;
};

export const Address = {
  createEmpty(): SellerAddress {
    return {
      city: "",
      cityArea: "",
      companyName: "",
      country: "",
      countryArea: "",
      postalCode: "",
      streetAddress1: "",
      streetAddress2: "",
    };
  },
};
