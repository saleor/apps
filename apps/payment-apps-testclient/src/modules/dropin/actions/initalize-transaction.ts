"use server";

import request from "graphql-request";
import { z } from "zod";

import { graphql } from "@/graphql/gql";
import { envUrlSchema } from "@/lib/env-url";
import { BaseError, UnknownError } from "@/lib/errors";
import { actionClient } from "@/lib/safe-action";

import { InitalizeTransactionSchema } from "../schemas/initalize-transaction";

const initalizeTransactionMutation = graphql(`
  mutation InitalizeTransaction(
    $checkoutId: ID!
    $data: JSON
    $idempotencyKey: String
    $paymentGatewayId: String!
    $amount: PositiveDecimal!
  ) {
    transactionInitialize(
      id: $checkoutId
      paymentGateway: { id: $paymentGatewayId, data: $data }
      amount: $amount
      idempotencyKey: $idempotencyKey
    ) {
      transaction {
        id
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

const InitalizeTransactionParsingResponseError = BaseError.subclass(
  "InitalizeTransactionParsingResponseError",
);
const InitalizeTransactionMutationError = BaseError.subclass("InitalizeTransactionMutationError");

export const initalizeTransaction = actionClient
  .schema(
    z.object({
      envUrl: envUrlSchema,
      checkoutId: z.string(),
      paymentGatewayId: z.string(),
      data: z.unknown(),
      amount: z.number(),
      idempotencyKey: z.string(),
    }),
  )
  .metadata({ actionName: "initalizeTransaction" })
  .action(
    async ({
      parsedInput: { envUrl, checkoutId, paymentGatewayId, data, amount, idempotencyKey },
    }) => {
      const response = await request(envUrl, initalizeTransactionMutation, {
        checkoutId,
        data,
        amount,
        idempotencyKey,
        paymentGatewayId,
      }).catch((error) => {
        throw BaseError.normalize(error, UnknownError);
      });
      const parsedResponse = InitalizeTransactionSchema.safeParse(response);

      if (!parsedResponse.success) {
        throw InitalizeTransactionParsingResponseError.normalize(parsedResponse.error);
      }

      if (parsedResponse.data.transactionInitialize.errors.length > 0) {
        throw new InitalizeTransactionMutationError(
          "Failed to create checkout - errors in initalizeTransaction mutation.",
          {
            errors: parsedResponse.data.transactionInitialize.errors.map((e) =>
              InitalizeTransactionMutationError.normalize(e),
            ),
          },
        );
      }

      return parsedResponse.data;
    },
  );
