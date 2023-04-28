import { AddressFragment as SaleorAddress } from "../../../../generated/graphql";
import { AddressParams as TaxJarAddress } from "taxjar/dist/types/paramTypes";
import { TaxJarConfig } from "../taxjar-config";

function joinAddresses(address1: string, address2: string): string {
  return `${address1}${address2.length > 0 ? " " + address2 : ""}`;
}

function mapSaleorAddressToTaxJarAddress(address: SaleorAddress): TaxJarAddress {
  return {
    street: joinAddresses(address.streetAddress1, address.streetAddress2),
    city: address.city,
    zip: address.postalCode,
    state: address.countryArea,
    country: address.country.code,
  };
}

function mapChannelAddressToTaxJarAddress(address: TaxJarConfig["address"]): TaxJarAddress {
  return {
    city: address.city,
    country: address.country,
    state: address.state,
    street: address.street,
    zip: address.zip,
  };
}

export const taxJarAddressFactory = {
  fromSaleorAddress: mapSaleorAddressToTaxJarAddress,
  fromChannelAddress: mapChannelAddressToTaxJarAddress,
};
