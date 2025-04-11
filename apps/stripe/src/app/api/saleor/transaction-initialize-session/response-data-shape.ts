import { z } from "zod";

export const TransactionInitalizeSessionResponseDataShape = z.object({
  stripeClientSecret: z.string(),
});

export type TransactionInitalizeSessionResponseDataShapeType = z.infer<
  typeof TransactionInitalizeSessionResponseDataShape
>;
