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

import { StoredPaymentMethodSchema } from "../schemas";

const GetStoredPaymentMethodsSchema = z.object({
  me: z
    .object({
      storedPaymentMethods: z.array(StoredPaymentMethodSchema).nullable(),
    })
    .nullable(),
});

const GetStoredPaymentMethodsQuery = graphql(`
  query GetSquareStoredPaymentMethods($channelSlug: String!) {
    me {
      storedPaymentMethods(channel: $channelSlug) {
        id
        gateway {
          id
          name
        }
        paymentMethodId
        creditCardInfo {
          brand
          lastDigits
          expMonth
          expYear
        }
        supportedPaymentFlows
        type
        name
        data
      }
    }
  }
`);

const GetStoredPaymentMethodsParsingResponseError = BaseError.subclass(
  "GetStoredPaymentMethodsParsingResponseError",
);

export const getStoredPaymentMethods = actionClient
  .schema(
    z.object({
      envUrl: envUrlSchema,
      channelSlug: z.string().min(1),
      paymentGatewayId: z.string().min(1),
      customerSession: customerSessionInputSchema,
    }),
  )
  .metadata({ actionName: "getStoredPaymentMethods" })
  .action(async ({ parsedInput: { envUrl, channelSlug, paymentGatewayId, customerSession } }) => {
    const requestResult = await requestWithCustomerTokenRefresh({
      envUrl,
      document: GetStoredPaymentMethodsQuery,
      variables: {
        channelSlug,
      },
      customerSession,
    });

    if (requestResult.status === "error") {
      return {
        status: "error" as const,
        error: requestResult.error,
        refreshedSession: null,
      };
    }

    const parsedResponse = GetStoredPaymentMethodsSchema.safeParse(requestResult.response);

    if (parsedResponse.error) {
      throw GetStoredPaymentMethodsParsingResponseError.normalize(parsedResponse.error);
    }

    if (!parsedResponse.data.me) {
      return {
        status: "error" as const,
        error: {
          code: "CUSTOMER_SESSION_UNAVAILABLE",
          field: null,
          message: "Saleor did not return a customer session.",
        },
        refreshedSession: requestResult.refreshedSession,
      };
    }

    return {
      status: "success" as const,
      methods:
        parsedResponse.data.me.storedPaymentMethods?.filter(
          (method) => method.gateway.id === paymentGatewayId,
        ) ?? [],
      refreshedSession: requestResult.refreshedSession,
    };
  });
