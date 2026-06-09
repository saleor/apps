import { v4 as uuidv4 } from "uuid";

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
