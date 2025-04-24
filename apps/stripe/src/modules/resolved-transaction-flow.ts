import { z } from "zod";

const resolvedTransactionFlowSchema = z
  .enum(["AUTHORIZATION", "CHARGE"])
  .brand("ResolvedTransactionFlow");

export const createResolvedTransactionFlow = (raw: string) =>
  resolvedTransactionFlowSchema.parse(raw);

export type ResolvedTransationFlow = z.infer<typeof resolvedTransactionFlowSchema>;
