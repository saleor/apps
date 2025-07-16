import { z } from "zod";

const schema = z
  .object({
    errors: z.array(
      z.object({
        codes: z.array(z.string()),
        id: z.string().optional(),
      }),
    ),
  })
  .brand("AtobaraiRegisterTransactionErrorResponse");

export const createAtobaraiErrorResponse = (rawResponse: unknown) => schema.parse(rawResponse);

export type AtobaraiErrorResponse = z.infer<typeof schema>;
