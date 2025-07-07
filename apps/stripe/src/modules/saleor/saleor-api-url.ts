import { fromThrowable } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/lib/errors";

/**
 * @deprecated use @saleor/domain
 */
export const SaleorApiUrlValidationError = BaseError.subclass("SaleorApiUrlValidationError", {
  props: {
    _internalName: "SaleorApiUrl.ValidationError" as const,
  },
});

const saleorApiUrlSchema = z
  .string()
  .url()
  .endsWith("/graphql/")
  .refine((value) => value.startsWith("http://") || value.startsWith("https://"), {
    message: 'Invalid input: must start with "http://" or "https://"',
  })
  .brand("SaleorApiUrl");

/**
 * @deprecated use @saleor/domain
 */
export const createSaleorApiUrl = (raw: string) =>
  fromThrowable(saleorApiUrlSchema.parse, (error) => SaleorApiUrlValidationError.normalize(error))(
    raw,
  );

/**
 * @deprecated use @saleor/domain
 */
export type SaleorApiUrl = z.infer<typeof saleorApiUrlSchema>;
