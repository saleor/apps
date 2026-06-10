import { v4 as uuidv4 } from "uuid";

import { type CountryCode } from "@/generated/graphql";

/**
 * Names are removed entirely - replaced with an empty placeholder.
 */
const SCRAMBLED_NAME_PLACEHOLDER = "";

const SCRAMBLED_PHONE_PLACEHOLDER = "";

/**
 * The street address (street name + number) is overwritten with a constant fake
 * value. It is free text in Saleor, so it needs no country-specific format -
 * unlike the city, postal code and country area, which are kept intact.
 */
const SCRAMBLED_STREET_PLACEHOLDER = "Anonymized";

/**
 * Produces anonymized values for a single address (name, phone and street).
 */
export const scrambleDetails = (_details: {
  firstName: string;
  lastName: string;
  phone?: string | null;
}) => {
  return {
    scrambledFirstName: SCRAMBLED_NAME_PLACEHOLDER,
    scrambledLastName: SCRAMBLED_NAME_PLACEHOLDER,
    scrambledPhone: SCRAMBLED_PHONE_PLACEHOLDER,
    scrambledStreetAddress1: SCRAMBLED_STREET_PLACEHOLDER,
  };
};

/**
 * Builds an anonymized `AddressInput` from an order address, keeping the
 * non-identifying fields (city, postal code, country) intact.
 */
export const scrambleAddress = <
  TAddress extends {
    firstName: string;
    lastName: string;
    phone?: string | null;
    city: string;
    postalCode: string;
    streetAddress1: string;
    countryArea: string;
    country: { code: string };
  },
>(
  address: TAddress | null | undefined,
) => {
  if (!address) {
    return null;
  }

  const { scrambledFirstName, scrambledLastName, scrambledPhone, scrambledStreetAddress1 } =
    scrambleDetails({
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
    });

  return {
    firstName: scrambledFirstName,
    lastName: scrambledLastName,
    phone: scrambledPhone,
    city: address.city,
    postalCode: address.postalCode,
    streetAddress1: scrambledStreetAddress1,
    country: address.country.code as CountryCode,
    countryArea: address.countryArea,
  };
};

/**
 * Produces anonymized user details. The email is replaced with a random UUID
 * under the configured scramble domain, so it stays unique but unusable.
 */
export const scrambleUserDetails = (domain: string) => {
  const sharedUuid = uuidv4();

  return {
    firstName: SCRAMBLED_NAME_PLACEHOLDER,
    lastName: SCRAMBLED_NAME_PLACEHOLDER,
    email: `${sharedUuid}@${domain}`,
  };
};
