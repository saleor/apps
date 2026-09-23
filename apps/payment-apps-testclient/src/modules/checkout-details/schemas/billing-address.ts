import { z } from "zod";

import { countryCodes } from "../countries";

export const BillingAddressSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  streetAddress1: z.string(),
  city: z.string(),
  countryArea: z.string().optional(),
  country: z.enum(countryCodes),
  postalCode: z.string(),
});
