import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { zodReadableError } from "@/lib/zod-readable-error";

import { AtobaraiTransactionIdSchema } from "../atobarai-transaction-id";

const schema = z
  .object({
    results: z.array(
      z.object({
        np_transaction_id: AtobaraiTransactionIdSchema,
      }),
    ),
  })
  .brand("AtobaraiFulfillmentReportSuccessResponse");

export const AtobaraiFulfillmentReportSuccessResponseValidationError = BaseError.subclass(
  "AtobaraiFulfillmentReportSuccessResponseValidationError",
  {
    props: {
      _brand: "AtobaraiFulfillmentReportSuccessResponseValidationError" as const,
    },
  },
);

export const createAtobaraiFulfillmentReportSuccessResponse = (
  raw: unknown | AtobaraiFulfillmentReportSuccessResponse,
) => {
  const parseResult = schema.safeParse(raw);

  if (!parseResult.success) {
    const readableError = zodReadableError(parseResult.error);

    throw new AtobaraiFulfillmentReportSuccessResponseValidationError(
      `Invalid Atobarai fulfillment report success response format: ${readableError.message}`,
      { cause: readableError },
    );
  }

  return parseResult.data;
};

export type AtobaraiFulfillmentReportSuccessResponse = z.infer<typeof schema>;
