import { TaxParams } from "taxjar/dist/types/paramTypes";
import { AddressFragment as SaleorAddress } from "../../../generated/graphql";
import { TaxJarConfig } from "./taxjar-connection-schema";
import { AddressParams } from "taxjar/dist/types/paramTypes";

function joinAddresses(address1: string, address2: string): string {
  return `${address1}${address2.length > 0 ? " " + address2 : ""}`;
}

function mapSaleorAddressToTaxJarAddress(
  address: SaleorAddress,
): Pick<TaxParams, "to_city" | "to_country" | "to_state" | "to_street" | "to_zip"> {
  return {
    to_street: joinAddresses(address.streetAddress1, address.streetAddress2),
    to_city: address.city,
    to_zip: address.postalCode,
    to_state: address.countryArea,
    to_country: address.country.code,
  };
}

function mapChannelAddressToTaxJarAddress(
  address: TaxJarConfig["address"],
): Pick<TaxParams, "from_city" | "from_country" | "from_state" | "from_street" | "from_zip"> {
  return {
    from_city: address.city,
    from_country: address.country,
    from_state: address.state,
    from_street: address.street,
    from_zip: address.zip,
  };
}

function mapChannelAddressToAddressParams(address: TaxJarConfig["address"]): AddressParams {
  return {
    city: address.city,
    country: address.country,
    state: address.state,
    street: address.street,
    zip: address.zip,
  };
}

export const taxJarAddressFactory = {
  fromSaleorToTax: mapSaleorAddressToTaxJarAddress,
  fromChannelToTax: mapChannelAddressToTaxJarAddress,
  fromChannelToParams: mapChannelAddressToAddressParams,
};
