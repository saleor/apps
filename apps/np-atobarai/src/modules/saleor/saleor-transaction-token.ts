import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { zodReadableError } from "@/lib/zod-readable-error";

const schema = z.string().min(1).brand("SaleorTransactionToken");

export const SaleorTransactionTokenValidationError = BaseError.subclass(
  "SaleorTransactionTokenValidationError",
  {
    props: {
      _brand: "SaleorTransactionTokenValidationError" as const,
    },
  },
);

export const createSaleorTransactionToken = (raw: string) => {
  const parseResult = schema.safeParse(raw);

  if (!parseResult.success) {
    const readableError = zodReadableError(parseResult.error);

    throw new SaleorTransactionTokenValidationError(
      `Invalid transaction token: ${readableError.message}`,
      {
        cause: readableError,
      },
    );
  }

  return parseResult.data;
};

export type SaleorTransactionToken = z.infer<typeof schema>;
