import { z } from "zod";

const schema = z.string().brand("AtobaraiTransactionId");

export type AtobaraiTransactionId = z.infer<typeof schema>;

export const createAtobaraiTransactionId = (rawTransactionId: unknown): AtobaraiTransactionId =>
  schema.parse(rawTransactionId);
