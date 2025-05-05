import { z } from "zod";

const resolvedTransactionFlowSchema = z
  .enum(["AUTHORIZATION", "CHARGE"])
  .brand("ResolvedTransactionFlow");

export const createResolvedTransactionFlow = (raw: string) =>
  resolvedTransactionFlowSchema.parse(raw);

export type ResolvedTransactionFlow = z.infer<typeof resolvedTransactionFlowSchema>;
