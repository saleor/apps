import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { zodReadableError } from "@/lib/zod-readable-error";

const schema = z.string().min(1).brand("AtobaraiMerchantCode");

export const AtobaraiMerchantCodeValidationError = BaseError.subclass(
  "AtobaraiMerchantCodeValidationError",
  {
    props: {
      _brand: "AtobaraiMerchantCodeValidationError" as const,
    },
  },
);

export const createAtobaraiMerchantCode = (raw: string) => {
  const parseResult = schema.safeParse(raw);

  if (!parseResult.success) {
    const readableError = zodReadableError(parseResult.error);

    throw new AtobaraiMerchantCodeValidationError(
      `Invalid merchant code: ${readableError.message}`,
      { cause: readableError },
    );
  }

  return parseResult.data;
};

/**
 * Code used in the NP Atobarai to uniquely identify the merchant. Used in conjunction with the merchant code as basic authentication (as login). See `AtobaraiApiClient` for more details.
 */
export type AtobaraiMerchantCode = z.infer<typeof schema>;
