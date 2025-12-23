import { BaseError } from "@saleor/errors";
import { z } from "zod";

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
    throw new AtobaraiFulfillmentReportSuccessResponseValidationError(
      `Invalid Atobarai fulfillment report success response format: ${parseResult.error.errors
        .map((e) => e.message)
        .join(", ")}`,
      { cause: parseResult.error },
    );
  }

  return parseResult.data;
};

export type AtobaraiFulfillmentReportSuccessResponse = z.infer<typeof schema>;
