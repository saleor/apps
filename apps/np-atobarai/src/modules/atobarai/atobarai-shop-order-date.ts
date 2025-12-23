import { BaseError } from "@saleor/errors";
import { z } from "zod";

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
    throw new AtobaraiShopOrderDateValidationError(
      `Invalid shop order date: ${parseResult.error.errors.map((e) => e.message).join(", ")}`,
      { cause: parseResult.error },
    );
  }

  return parseResult.data;
};

export type AtobaraiShopOrderDate = z.infer<typeof schema>;
