import { z } from "zod";

import { BaseError } from "../src/base-error";

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

export const createSaleorApiUrl = (raw: string) => {
  try {
    return saleorApiUrlSchema.parse(raw);
  } catch (e) {
    throw new SaleorApiUrlValidationError("SaleorApiUrl is invalid", {
      cause: e,
    });
  }
};

export type SaleorApiUrl = z.infer<typeof saleorApiUrlSchema>;
