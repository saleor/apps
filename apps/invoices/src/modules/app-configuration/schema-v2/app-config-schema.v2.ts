import { z } from "zod";

export const AddressV2Schema = z.object({
  /**
   * min() to allow empty strings
   */
  companyName: z.string().optional(),
  cityArea: z.string().optional(),
  countryArea: z.string().optional(),
  streetAddress1: z.string().optional(),
  streetAddress2: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});
export const AppConfigV2Schema = z.object({
  channelsOverrides: z.record(AddressV2Schema),
});

export type AppConfigV2Shape = z.infer<typeof AppConfigV2Schema>;
export type AddressV2Shape = z.infer<typeof AddressV2Schema>;
