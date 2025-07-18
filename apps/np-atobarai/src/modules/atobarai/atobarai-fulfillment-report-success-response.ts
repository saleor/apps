import { z } from "zod";

const schema = z.object({
  results: z.array(
    z.object({
      np_transaction_id: z.string(),
    }),
  ),
});

export const createAtobaraiFulfillmentReportSuccessResponse = (raw: unknown) => schema.parse(raw);

export type AtobaraiFulfillmentReportSuccessResponse = z.infer<typeof schema>;
