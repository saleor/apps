import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { zodReadableError } from "@/lib/zod-readable-error";

const transformTo_YYYY_MM_DD = (stringDate: string) => stringDate.split("T")[0];

const schema = z
  .string()
  .datetime({ offset: true })
  .transform(transformTo_YYYY_MM_DD)
  .brand("AtobaraiShopOrderDate");

export const AtobaraiShopOrderDateValidationError = BaseError.subclass(
  "AtobaraiShopOrderDateValidationError",
  {
    props: {
      _brand: "AtobaraiShopOrderDateValidationError" as const,
    },
  },
);

export const createAtobaraiShopOrderDate = (raw: string) => {
  const parseResult = schema.safeParse(raw);

  if (!parseResult.success) {
    const readableError = zodReadableError(parseResult.error);

    throw new AtobaraiShopOrderDateValidationError(
      `Invalid shop order date: ${readableError.message}`,
      { cause: readableError },
    );
  }

  return parseResult.data;
};

export type AtobaraiShopOrderDate = z.infer<typeof schema>;
