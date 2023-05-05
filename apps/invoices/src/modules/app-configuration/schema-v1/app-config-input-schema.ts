import { z } from "zod";

export const appConfigInputSchema = z.object({
  shopConfigPerChannel: z.record(
    z.object({
      address: z.object({
        /**
         * min() to allow empty strings
         */
        companyName: z.string().min(0),
        cityArea: z.string().min(0),
        countryArea: z.string().min(0),
        streetAddress1: z.string().min(0),
        streetAddress2: z.string().min(0),
        postalCode: z.string().min(0),
        city: z.string().min(0),
        country: z.string().min(0),
      }),
    })
  ),
});
