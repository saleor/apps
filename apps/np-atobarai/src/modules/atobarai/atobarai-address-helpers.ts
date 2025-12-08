import { AddressFragment, SourceObjectFragment } from "@/generated/graphql";

export const formatCustomerName = (address: AddressFragment): string => {
  return `${address.lastName} ${address.firstName}`;
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
