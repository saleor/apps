import { z } from "zod";

const saleorTransactionFlowSchema = z
  .enum(["AUTHORIZATION", "CHARGE"])
  .brand("SaleorTransactionFlow");

export const createSaleorTransactionFlow = (raw: string) => saleorTransactionFlowSchema.parse(raw);

export type SaleorTransationFlow = z.infer<typeof saleorTransactionFlowSchema>;
