import { z } from "zod";

const StripeCustomerIdSchema = z.string().startsWith("cus_").brand("StripeCustomerId");

export const createStripeCustomerId = (raw: string) => StripeCustomerIdSchema.parse(raw);

export type StripeCustomerId = z.infer<typeof StripeCustomerIdSchema>;
