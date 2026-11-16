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

import { SquareTokenizationConfigSchema, storedPaymentMethodErrorSchema } from "../schemas";

const InitializeSquareTokenizationSchema = z.object({
  paymentGatewayInitializeTokenization: z
    .object({
      result: z.string(),
      data: z.unknown().nullable(),
      errors: z.array(storedPaymentMethodErrorSchema),
    })
    .nullable(),
});

const InitializeSquareTokenizationMutation = graphql(`
  mutation InitializeSquareTokenization($channelSlug: String!, $data: JSON, $id: String!) {
    paymentGatewayInitializeTokenization(channel: $channelSlug, data: $data, id: $id) {
      result
      data
      errors {
        field
        message
        code
      }
    }
  }
`);

const InitializeSquareTokenizationParsingResponseError = BaseError.subclass(
  "InitializeSquareTokenizationParsingResponseError",
);

const getInitializeErrorResult = (
  error: z.infer<typeof storedPaymentMethodErrorSchema> | undefined,
) => ({
  status: "error" as const,
  error: {
    code: error?.code,
    field: error?.field,
    message: error?.message ?? "Saleor could not initialize Square saved-card tokenization.",
  },
});

export const initializeSquareTokenization = actionClient
  .schema(
    z.object({
      envUrl: envUrlSchema,
      channelSlug: z.string().min(1),
      paymentGatewayId: z.string().min(1),
      customerSession: customerSessionInputSchema,
    }),
  )
  .metadata({ actionName: "initializeSquareTokenization" })
  .action(async ({ parsedInput: { envUrl, channelSlug, paymentGatewayId, customerSession } }) => {
    const requestResult = await requestWithCustomerTokenRefresh({
      envUrl,
      document: InitializeSquareTokenizationMutation,
      variables: {
        channelSlug,
        data: null,
        id: paymentGatewayId,
      },
      customerSession,
    });

    if (requestResult.status === "error") {
      return {
        ...getInitializeErrorResult(requestResult.error),
        refreshedSession: null,
      };
    }

    const parsedResponse = InitializeSquareTokenizationSchema.safeParse(requestResult.response);

    if (parsedResponse.error) {
      throw InitializeSquareTokenizationParsingResponseError.normalize(parsedResponse.error);
    }

    const initializeResult = parsedResponse.data.paymentGatewayInitializeTokenization;

    if (!initializeResult) {
      return {
        ...getInitializeErrorResult(undefined),
        refreshedSession: requestResult.refreshedSession,
      };
    }

    if (initializeResult.errors.length > 0) {
      return {
        ...getInitializeErrorResult(initializeResult.errors[0]),
        refreshedSession: requestResult.refreshedSession,
      };
    }

    if (initializeResult.result !== "SUCCESSFULLY_INITIALIZED") {
      return {
        ...getInitializeErrorResult({
          code: initializeResult.result,
          field: null,
          message: "Square saved-card tokenization was not initialized.",
        }),
        refreshedSession: requestResult.refreshedSession,
      };
    }

    const parsedConfig = SquareTokenizationConfigSchema.safeParse(initializeResult.data);

    if (parsedConfig.error) {
      throw InitializeSquareTokenizationParsingResponseError.normalize(parsedConfig.error);
    }

    return {
      status: "success" as const,
      squareConfig: parsedConfig.data,
      refreshedSession: requestResult.refreshedSession,
    };
  });
