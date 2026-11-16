"use server";

import { z } from "zod";

import { graphql } from "@/graphql/gql";
import { envUrlSchema } from "@/lib/env-url";
import { BaseError } from "@/lib/errors";
import { actionClient } from "@/lib/safe-action";
import {
  customerSessionInputSchema,
  requestWithCustomerTokenRefresh,
} from "@/modules/customer-session/actions/customer-token";

import { storedPaymentMethodErrorSchema } from "../schemas";

const SQUARE_TRANSACTION_DATA_VERSION = "saleor.app.square.v1";

const SaveSquarePaymentMethodSchema = z.object({
  paymentMethodInitializeTokenization: z
    .object({
      result: z.string(),
      id: z.string().nullable(),
      data: z.unknown().nullable(),
      errors: z.array(storedPaymentMethodErrorSchema),
    })
    .nullable(),
});

const SaveSquarePaymentMethodMutation = graphql(`
  mutation SaveSquarePaymentMethod(
    $channelSlug: String!
    $data: JSON
    $id: String!
    $paymentFlowToSupport: TokenizedPaymentFlowEnum!
  ) {
    paymentMethodInitializeTokenization(
      channel: $channelSlug
      data: $data
      id: $id
      paymentFlowToSupport: $paymentFlowToSupport
    ) {
      result
      id
      data
      errors {
        field
        message
        code
      }
    }
  }
`);

const SaveSquarePaymentMethodParsingResponseError = BaseError.subclass(
  "SaveSquarePaymentMethodParsingResponseError",
);

const getSaveErrorResult = (error: z.infer<typeof storedPaymentMethodErrorSchema> | undefined) => ({
  status: "error" as const,
  error: {
    code: error?.code,
    field: error?.field,
    message: error?.message ?? "Saleor could not save the Square card.",
  },
});

export const saveSquarePaymentMethod = actionClient
  .schema(
    z.object({
      envUrl: envUrlSchema,
      channelSlug: z.string().min(1),
      paymentGatewayId: z.string().min(1),
      customerSession: customerSessionInputSchema,
      sourceId: z.string().min(1),
    }),
  )
  .metadata({ actionName: "saveSquarePaymentMethod" })
  .action(
    async ({
      parsedInput: { envUrl, channelSlug, paymentGatewayId, customerSession, sourceId },
    }) => {
      const requestResult = await requestWithCustomerTokenRefresh({
        envUrl,
        document: SaveSquarePaymentMethodMutation,
        variables: {
          channelSlug,
          id: paymentGatewayId,
          paymentFlowToSupport: "INTERACTIVE",
          data: {
            version: SQUARE_TRANSACTION_DATA_VERSION,
            method: "card",
            sourceId,
          },
        },
        customerSession,
      });

      if (requestResult.status === "error") {
        return {
          ...getSaveErrorResult(requestResult.error),
          refreshedSession: null,
        };
      }

      const parsedResponse = SaveSquarePaymentMethodSchema.safeParse(requestResult.response);

      if (parsedResponse.error) {
        throw SaveSquarePaymentMethodParsingResponseError.normalize(parsedResponse.error);
      }

      const tokenizationResult = parsedResponse.data.paymentMethodInitializeTokenization;

      if (!tokenizationResult) {
        return {
          ...getSaveErrorResult(undefined),
          refreshedSession: requestResult.refreshedSession,
        };
      }

      if (tokenizationResult.errors.length > 0) {
        return {
          ...getSaveErrorResult(tokenizationResult.errors[0]),
          refreshedSession: requestResult.refreshedSession,
        };
      }

      if (tokenizationResult.result !== "SUCCESSFULLY_TOKENIZED") {
        return {
          ...getSaveErrorResult({
            code: tokenizationResult.result,
            field: null,
            message: "Square did not return a saved payment method.",
          }),
          refreshedSession: requestResult.refreshedSession,
        };
      }

      return {
        status: "success" as const,
        id: tokenizationResult.id,
        data: tokenizationResult.data,
        refreshedSession: requestResult.refreshedSession,
      };
    },
  );
