import { ShopInfoFragment, ShopInfoQuery } from "../../../generated/graphql";
import { AddressV2Shape } from "../app-configuration/schema-v2/app-config-schema.v2";

export const shopInfoQueryToAddressShape = (
  shopFragment: ShopInfoFragment | null
): AddressV2Shape | null => {
  if (!shopFragment?.companyAddress) {
    return null;
  }

  const {
    streetAddress2,
    streetAddress1,
    country,
    countryArea,
    postalCode,
    cityArea,
    companyName,
    city,
  } = shopFragment.companyAddress;

  return {
    city,
    cityArea,
    companyName,
    country: country.country,
    countryArea,
    postalCode,
    streetAddress1,
    streetAddress2,
  };
};
