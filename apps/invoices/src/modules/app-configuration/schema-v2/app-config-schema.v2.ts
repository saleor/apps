import { z } from "zod";

export const AddressV2Schema = z.object({
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
});
export const AppConfigV2Schema = z.object({
  channelsOverrides: z.record(AddressV2Schema),
});

export type AppConfigV2Shape = z.infer<typeof AppConfigV2Schema>;
