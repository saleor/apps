import { err, ok, Result } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/lib/errors";

export const saleorApiUrlSchema = z.string().url().endsWith("/graphql/").brand("SaleorApiUrl");

export type SaleorApiUrl = z.infer<typeof saleorApiUrlSchema>;

const SaleorApiUrlError = BaseError.subclass("SaleorApiUrlError");

export const createSaleorApiUrl = (
  raw: string,
): Result<SaleorApiUrl, InstanceType<typeof SaleorApiUrlError>> => {
  const result = saleorApiUrlSchema.safeParse(raw);

  if (!result.success) {
    return err(new SaleorApiUrlError(`Invalid Saleor API URL: ${raw}`, { cause: result.error }));
  }

  return ok(result.data);
};
