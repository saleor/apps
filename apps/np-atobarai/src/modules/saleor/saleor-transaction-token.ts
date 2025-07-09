import { z } from "zod";

const schema = z.string().min(1).brand("SaleorTransactionToken");

export const createSaleorTransactionToken = (raw: string) => schema.parse(raw);

export type SaleorTransactionToken = z.infer<typeof schema>;
