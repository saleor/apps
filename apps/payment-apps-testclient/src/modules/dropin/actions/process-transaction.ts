"use server";

import request from "graphql-request";
import { z } from "zod";

import { graphql } from "@/graphql/gql";
import { envUrlSchema } from "@/lib/env-url";
import { BaseError, UnknownError } from "@/lib/errors";
import { actionClient } from "@/lib/safe-action";

import { TransactionProcessSchema } from "../schemas/transaction-process";

const processTransactionMutation = graphql(`
  mutation transactionProcess($transactionId: ID!, $data: JSON) {
    transactionProcess(id: $transactionId, data: $data) {
      transaction {
        id
        actions
        message
        pspReference
        events {
          type
          id
          createdAt
          message
          pspReference
        }
      }
      data
      errors {
        field
        message
        code
      }
    }
  }
`);

const ProcessTransactionParsingResponseError = BaseError.subclass(
  "ProcessTransactionParsingResponseError",
);
const ProcessTransactionMutationError = BaseError.subclass("ProcessTransactionMutationError");

export const processTransaction = actionClient
  .schema(
    z.object({
      envUrl: envUrlSchema,
      transactionId: z.string(),
      data: z.unknown(),
    }),
  )
  .metadata({ actionName: "processTransaction" })
  .action(async ({ parsedInput: { envUrl, transactionId, data } }) => {
    const response = await request(envUrl, processTransactionMutation, {
      transactionId,
      data,
    }).catch((error) => {
      throw BaseError.normalize(error, UnknownError);
    });

    const parsedResponse = TransactionProcessSchema.safeParse(response);

    if (!parsedResponse.success) {
      throw ProcessTransactionParsingResponseError.normalize(parsedResponse.error);
    }

    if (parsedResponse.data.transactionProcess.errors.length > 0) {
      throw new ProcessTransactionMutationError(
        "Failed to process transaction - errors in processTransaction mutation",
        {
          errors: parsedResponse.data.transactionProcess.errors.map((e) =>
            ProcessTransactionMutationError.normalize(e),
          ),
        },
      );
    }

    return parsedResponse.data;
  });
