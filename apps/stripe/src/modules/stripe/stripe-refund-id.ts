import { z } from "zod";

const StripeRefundIdSchema = z.string().startsWith("re_").brand("StripeRefundId");

export const createStripeRefundId = (raw: string) => StripeRefundIdSchema.parse(raw);

export type StripeRefundId = z.infer<typeof StripeRefundIdSchema>;
