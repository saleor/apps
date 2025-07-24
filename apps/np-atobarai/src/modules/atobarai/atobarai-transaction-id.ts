import { z } from "zod";

export const AtobaraiTransactionIdSchema = z.string().length(11).brand("AtobaraiTransactionId");

export type AtobaraiTransactionId = z.infer<typeof AtobaraiTransactionIdSchema>;

export const createAtobaraiTransactionId = (rawTransactionId: string): AtobaraiTransactionId =>
  AtobaraiTransactionIdSchema.parse(rawTransactionId);
