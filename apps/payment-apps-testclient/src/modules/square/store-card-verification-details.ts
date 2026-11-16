type NullableString = string | null | undefined;

export type SaleorCheckoutContact = {
  email?: NullableString;
  billingAddress?: {
    firstName?: NullableString;
    lastName?: NullableString;
    streetAddress1?: NullableString;
    streetAddress2?: NullableString;
    city?: NullableString;
    countryArea?: NullableString;
    country?: {
      code?: NullableString;
    } | null;
    postalCode?: NullableString;
    phone?: NullableString;
  } | null;
};

type SquareBillingContact = {
  givenName?: string;
  familyName?: string;
  email?: string;
  phone?: string;
  addressLines?: string[];
  city?: string;
  state?: string;
  countryCode?: string;
  postalCode?: string;
};

export type SquareStoreCardVerificationDetails = {
  intent: "STORE";
  customerInitiated: true;
  sellerKeyedIn: false;
  billingContact: SquareBillingContact;
};

const normalize = (value: NullableString) => value?.trim() || undefined;

export const createSquareStoreCardVerificationDetails = ({
  email,
  billingAddress,
}: SaleorCheckoutContact): SquareStoreCardVerificationDetails => {
  const addressLines = [
    normalize(billingAddress?.streetAddress1),
    normalize(billingAddress?.streetAddress2),
  ].filter((line): line is string => Boolean(line));

  return {
    intent: "STORE",
    customerInitiated: true,
    sellerKeyedIn: false,
    billingContact: {
      givenName: normalize(billingAddress?.firstName),
      familyName: normalize(billingAddress?.lastName),
      email: normalize(email),
      phone: normalize(billingAddress?.phone),
      addressLines: addressLines.length > 0 ? addressLines : undefined,
      city: normalize(billingAddress?.city),
      state: normalize(billingAddress?.countryArea),
      countryCode: normalize(billingAddress?.country?.code),
      postalCode: normalize(billingAddress?.postalCode),
    },
  };
};
