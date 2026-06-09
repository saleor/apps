import { v4 as uuidv4 } from "uuid";

/**
 * Names are removed entirely - replaced with an empty placeholder.
 */
const SCRAMBLED_NAME_PLACEHOLDER = "";

/**
 * A constant, non-functional US phone number used to overwrite real numbers.
 * See https://en.wikipedia.org/wiki/555_(telephone_number)
 */
const NON_FUNCTIONAL_PHONE = "5551234567";

/**
 * Produces anonymized values for a single address (name + phone).
 */
export const scrambleDetails = (_details: {
  firstName: string;
  lastName: string;
  phone?: string | null;
}) => {
  return {
    scrambledFirstName: SCRAMBLED_NAME_PLACEHOLDER,
    scrambledLastName: SCRAMBLED_NAME_PLACEHOLDER,
    scrambledPhone: NON_FUNCTIONAL_PHONE,
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
