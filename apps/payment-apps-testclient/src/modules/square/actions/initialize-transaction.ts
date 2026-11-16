"use server";

import request from "graphql-request";
import { z } from "zod";

import { graphql } from "@/graphql/gql";
import { envUrlSchema } from "@/lib/env-url";
import { BaseError, UnknownError } from "@/lib/errors";
import { actionClient } from "@/lib/safe-action";
import { saleorRequestHeaders } from "@/lib/saleor-request-headers";

import { InitializeTransactionSchema } from "../schemas/initialize-transaction";

const initializeTransactionMutation = graphql(`
  mutation InitializeTransaction(
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
      transactionEvent {
        type
        message
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

const InitializeTransactionParsingResponseError = BaseError.subclass(
  "InitializeTransactionParsingResponseError",
);

export const initializeTransaction = actionClient
  .schema(
    z.object({
      envUrl: envUrlSchema,
      checkoutId: z.string(),
      paymentGatewayId: z.string(),
      data: z.unknown(),
      amount: z.number().positive(),
      idempotencyKey: z.string(),
    }),
  )
  .metadata({ actionName: "initializeTransaction" })
  .action(
    async ({
      parsedInput: { envUrl, checkoutId, paymentGatewayId, data, amount, idempotencyKey },
    }) => {
      const response = await request(
        envUrl,
        initializeTransactionMutation,
        {
          checkoutId,
          data,
          amount,
          idempotencyKey,
          paymentGatewayId,
        },
        saleorRequestHeaders,
      ).catch((error) => {
        throw BaseError.normalize(error, UnknownError);
      });
      const parsedResponse = InitializeTransactionSchema.safeParse(response);

      if (parsedResponse.error) {
        throw InitializeTransactionParsingResponseError.normalize(parsedResponse.error);
      }

      return parsedResponse.data;
    },
  );
