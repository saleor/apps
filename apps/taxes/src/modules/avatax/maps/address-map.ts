import { AddressLocationInfo as AvataxAddress } from "avatax/lib/models/AddressLocationInfo";
import { ChannelAddress } from "../../channels-configuration/channels-config";

export type SaleorAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  city: string;
  country: {
    code: string;
  };
  countryArea: string;
  postalCode: string;
};

function mapSaleorAddressToAvataxAddress(address: SaleorAddress): AvataxAddress {
  return {
    line1: address.streetAddress1,
    line2: address.streetAddress2,
    city: address.city,
    region: address.countryArea,
    postalCode: address.postalCode,
    country: address.country.code,
  };
}

function mapChannelAddressToAvataxAddress(address: ChannelAddress): AvataxAddress {
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
