import { z } from "zod";

export const appConfigInputSchema = z.object({
  shopConfigPerChannel: z.record(
    z.object({
      urlConfiguration: z.object({
        /**
         * min() to allow empty strings
         */
        storefrontUrl: z.string().min(0),
        productStorefrontUrl: z.string().min(0),
      }),
    })
  ),
});
