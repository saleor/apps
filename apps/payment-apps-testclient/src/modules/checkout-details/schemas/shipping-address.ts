import { z } from "zod";

import { countryCodes } from "../countries";

export const ShippingAddressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  streetAddress1: z.string().min(1),
  city: z.string().min(1),
  countryArea: z.string().optional(),
  country: z.enum(countryCodes),
  postalCode: z.string().min(1),
});
