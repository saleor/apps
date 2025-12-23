import { BaseError } from "@saleor/errors";
import { z } from "zod";

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
    throw new AtobaraiMerchantCodeValidationError(
      `Invalid merchant code: ${parseResult.error.errors.map((e) => e.message).join(", ")}`,
      { cause: parseResult.error },
    );
  }

  return parseResult.data;
};

/**
 * Code used in the NP Atobarai to uniquely identify the merchant. Used in conjunction with the merchant code as basic authentication (as login). See `AtobaraiApiClient` for more details.
 */
export type AtobaraiMerchantCode = z.infer<typeof schema>;
