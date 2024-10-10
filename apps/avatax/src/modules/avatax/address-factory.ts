import { AddressLocationInfo as AvataxAddress } from "avatax/lib/models/AddressLocationInfo";

import { AddressFragmentType } from "../../../graphql/fragments/AddressFragment";
import { AvataxConfig } from "./avatax-connection-schema";

function mapSaleorAddressToAvataxAddress(address: AddressFragmentType): AvataxAddress {
  return {
    line1: address.streetAddress1,
    line2: address.streetAddress2,
    city: address.city,
    region: address.countryArea,
    postalCode: address.postalCode,
    country: address.country.code,
  };
}

function mapChannelAddressToAvataxAddress(address: AvataxConfig["address"]): AvataxAddress {
  return {
    line1: address.street,
    city: address.city,
    region: address.state,
    postalCode: address.zip,
    country: address.country,
  };
}

export const avataxAddressFactory = {
  fromSaleorAddress: mapSaleorAddressToAvataxAddress,
  fromChannelAddress: mapChannelAddressToAvataxAddress,
};
