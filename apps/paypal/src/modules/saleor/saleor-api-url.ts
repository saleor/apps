import { z } from "zod";

export const saleorApiUrlSchema = z.string().url().endsWith("/graphql/").brand("SaleorApiUrl");

export type SaleorApiUrl = z.infer<typeof saleorApiUrlSchema>;

export const createSaleorApiUrl = (raw: string) => {
  return saleorApiUrlSchema.safeParse(raw);
};
