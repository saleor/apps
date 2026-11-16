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

const DeleteStoredPaymentMethodSchema = z.object({
  storedPaymentMethodRequestDelete: z
    .object({
      result: z.string(),
      errors: z.array(storedPaymentMethodErrorSchema),
    })
    .nullable(),
});

const DeleteStoredPaymentMethodMutation = graphql(`
  mutation DeleteSquareStoredPaymentMethod($channelSlug: String!, $id: ID!) {
    storedPaymentMethodRequestDelete(channel: $channelSlug, id: $id) {
      result
      errors {
        field
        message
        code
      }
    }
  }
`);

const DeleteStoredPaymentMethodParsingResponseError = BaseError.subclass(
  "DeleteStoredPaymentMethodParsingResponseError",
);

const getDeleteErrorResult = (
  error: z.infer<typeof storedPaymentMethodErrorSchema> | undefined,
) => ({
  status: "error" as const,
  error: {
    code: error?.code,
    field: error?.field,
    message: error?.message ?? "Saleor could not remove the saved card.",
  },
});

export const deleteStoredPaymentMethod = actionClient
  .schema(
    z.object({
      envUrl: envUrlSchema,
      channelSlug: z.string().min(1),
      storedPaymentMethodId: z.string().min(1),
      customerSession: customerSessionInputSchema,
    }),
  )
  .metadata({ actionName: "deleteStoredPaymentMethod" })
  .action(
    async ({ parsedInput: { envUrl, channelSlug, storedPaymentMethodId, customerSession } }) => {
      const requestResult = await requestWithCustomerTokenRefresh({
        envUrl,
        document: DeleteStoredPaymentMethodMutation,
        variables: {
          channelSlug,
          id: storedPaymentMethodId,
        },
        customerSession,
      });

      if (requestResult.status === "error") {
        return {
          ...getDeleteErrorResult(requestResult.error),
          refreshedSession: null,
        };
      }

      const parsedResponse = DeleteStoredPaymentMethodSchema.safeParse(requestResult.response);

      if (parsedResponse.error) {
        throw DeleteStoredPaymentMethodParsingResponseError.normalize(parsedResponse.error);
      }

      const deleteResult = parsedResponse.data.storedPaymentMethodRequestDelete;

      if (!deleteResult) {
        return {
          ...getDeleteErrorResult(undefined),
          refreshedSession: requestResult.refreshedSession,
        };
      }

      if (deleteResult.errors.length > 0) {
        return {
          ...getDeleteErrorResult(deleteResult.errors[0]),
          refreshedSession: requestResult.refreshedSession,
        };
      }

      if (deleteResult.result !== "SUCCESSFULLY_DELETED") {
        return {
          ...getDeleteErrorResult({
            code: deleteResult.result,
            field: null,
            message: "Square did not confirm saved-card removal.",
          }),
          refreshedSession: requestResult.refreshedSession,
        };
      }

      return {
        status: "success" as const,
        refreshedSession: requestResult.refreshedSession,
      };
    },
  );
