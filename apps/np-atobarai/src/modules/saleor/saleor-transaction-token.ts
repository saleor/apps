import { BaseError } from "@saleor/errors";
import { z } from "zod";

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
    throw new SaleorTransactionTokenValidationError(
      `Invalid transaction token: ${parseResult.error.errors.map((e) => e.message).join(", ")}`,
      { cause: parseResult.error },
    );
  }

  return parseResult.data;
};

export type SaleorTransactionToken = z.infer<typeof schema>;
