import { z } from "zod";

const schema = z.object({
  transactions: z.array(
    z.object({
      np_transaction_id: z.string(),
      pd_company_code: z.string(),
      slip_no: z.string(),
    }),
  ),
});

export const createAtobaraiFulfillmentReportPayload = (raw: unknown) => schema.parse(raw);

export type AtobaraiFulfillmentReportPayload = z.infer<typeof schema>;
