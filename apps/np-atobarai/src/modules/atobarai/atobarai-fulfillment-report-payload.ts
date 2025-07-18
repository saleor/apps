import { z } from "zod";

import { AtobaraiShippingCompanyCode } from "./atobarai-shipping-company-code";
import { AtobaraiTransactionId } from "./atobarai-transaction-id";

const schema = z.object({
  transactions: z.array(
    z.object({
      np_transaction_id: z.string().length(11),
      pd_company_code: z.string().length(5),
      slip_no: z.string().max(20),
    }),
  ),
});

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
