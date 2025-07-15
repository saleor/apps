import { z } from "zod";

import {
  BeforeReviewTransaction,
  FailedAtobaraiTransaction,
  PassedAtobaraiTransaction,
  PendingAtobaraiTransaction,
} from "./atobarai-transaction";

const errorSchema = z
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
  errorSchema.parse(rawResponse);

export type AtobaraiRegisterTransactionErrorResponse = z.infer<typeof errorSchema>;

const successSchema = z
  .object({
    results: z.array(
      z.discriminatedUnion("authori_result", [
        PassedAtobaraiTransaction.schema,
        PendingAtobaraiTransaction.schema,
        FailedAtobaraiTransaction.schema,
        BeforeReviewTransaction.schema,
      ]),
    ),
  })
  .brand("AtobaraiRegisterTransactionSuccessResponse");

export const createAtobaraiRegisterTransactionSuccessResponse = (rawResponse: unknown) =>
  successSchema.parse(rawResponse);

export type AtobaraiRegisterTransactionSuccessResponse = z.infer<typeof successSchema>;
