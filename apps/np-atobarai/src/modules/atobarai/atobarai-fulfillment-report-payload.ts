import { z } from "zod";

import {
  AtobaraiShippingCompanyCode,
  AtobaraiShippingCompanyCodeSchema,
} from "./atobarai-shipping-company-code";
import { AtobaraiTransactionId, AtobaraiTransactionIdSchema } from "./atobarai-transaction-id";

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

export const createAtobaraiFulfillmentReportPayload = (args: {
  trackingNumber: string;
  atobaraiTransactionId: AtobaraiTransactionId;
  shippingCompanyCode: AtobaraiShippingCompanyCode;
}) =>
  schema.parse({
    transactions: [
      {
        np_transaction_id: args.atobaraiTransactionId,
        pd_company_code: args.shippingCompanyCode,
        slip_no: args.trackingNumber,
      },
    ],
  });

export type AtobaraiFulfillmentReportPayload = z.infer<typeof schema>;
