import { BaseError } from "@saleor/errors";
import { z } from "zod";

export const SaleorApiUrlValidationError = BaseError.subclass("SaleorApiUrlValidationError", {
  props: {
    _brand: "SaleorApiUrl.ValidationError" as const,
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
