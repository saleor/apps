import { BaseError } from "@saleor/errors";
import { z } from "zod";

import {
  AtobaraiShippingCompanyCode,
  AtobaraiShippingCompanyCodeSchema,
} from "../atobarai-shipping-company-code";
import { AtobaraiTransactionId, AtobaraiTransactionIdSchema } from "../atobarai-transaction-id";

const schema = z
  .object({
    transactions: z.array(
      z.object({
        np_transaction_id: AtobaraiTransactionIdSchema,
        pd_company_code: AtobaraiShippingCompanyCodeSchema,
        slip_no: z.string().min(1).max(20),
      }),
    ),
  })
  .brand("AtobaraiFulfillmentReportPayload");

export const AtobaraiFulfillmentReportPayloadValidationError = BaseError.subclass(
  "AtobaraiFulfillmentReportPayloadValidationError",
  {
    props: {
      _brand: "AtobaraiFulfillmentReportPayloadValidationError" as const,
    },
  },
);

export const createAtobaraiFulfillmentReportPayload = (args: {
  trackingNumber: string;
  atobaraiTransactionId: AtobaraiTransactionId;
  shippingCompanyCode: AtobaraiShippingCompanyCode;
}) => {
  const parseResult = schema.safeParse({
    transactions: [
      {
        np_transaction_id: args.atobaraiTransactionId,
        pd_company_code: args.shippingCompanyCode,
        slip_no: args.trackingNumber,
      },
    ],
  });

  if (!parseResult.success) {
    throw new AtobaraiFulfillmentReportPayloadValidationError(
      `Invalid fulfillment report payload: ${parseResult.error.errors
        .map((e) => e.message)
        .join(", ")}`,
      { cause: parseResult.error },
    );
  }

  return parseResult.data;
};

export type AtobaraiFulfillmentReportPayload = z.infer<typeof schema>;
