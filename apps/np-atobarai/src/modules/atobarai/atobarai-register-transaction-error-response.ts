import { z } from "zod";

const schema = z
  .object({
    errors: z.array(
      z.object({
        codes: z.array(z.string()),
        id: z.string(),
      }),
    ),
  })
  .brand("AtobaraiRegisterTransactionErrorResponse");

export const createAtobaraiRegisterTransactionErrorResponse = (rawResponse: unknown) =>
  schema.parse(rawResponse);

export type AtobaraiRegisterTransactionErrorResponse = z.infer<typeof schema>;
