import { AddressFragment, SourceObjectFragment } from "@/generated/graphql";

export const formatCustomerName = (address: AddressFragment): string => {
  return `${address.lastName} ${address.firstName}`;
};

export const formatAddress = (address: AddressFragment): string => {
  /*
   * TODO: add support for fill_missing_address
   */
  return `${address.countryArea}${address.streetAddress1}${address.streetAddress2}`;
};

export const formatPhone = (phone: string): string => {
  return phone.replace("+81", "0");
};

export const getEmailFromSourceObject = (
  sourceObject: SourceObjectFragment,
): string | null | undefined => {
  switch (sourceObject.__typename) {
    case "Checkout":
      return sourceObject.email;
    case "Order":
      return sourceObject.userEmail;
    default:
      return null;
  }
};
