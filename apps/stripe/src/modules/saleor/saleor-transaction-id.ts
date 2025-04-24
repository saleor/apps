import { z } from "zod";

const saleorTransactionIdSchema = z.string().min(1).brand("SaleorTransactionId");

export const createSaleorTransactionId = (raw: string) => saleorTransactionIdSchema.parse(raw);

export type SaleorTransationId = z.infer<typeof saleorTransactionIdSchema>;
