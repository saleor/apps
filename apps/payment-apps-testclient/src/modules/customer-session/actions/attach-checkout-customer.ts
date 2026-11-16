"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { graphql } from "@/graphql/gql";
import { envUrlSchema } from "@/lib/env-url";
import { BaseError } from "@/lib/errors";
import { actionClient } from "@/lib/safe-action";
import { createPath } from "@/lib/utils";
import {
  customerSessionInputSchema,
  requestWithCustomerTokenRefresh,
} from "@/modules/customer-session/actions/customer-token";

const checkoutErrorSchema = z.object({
  field: z.string().nullable(),
  message: z.string().nullable(),
  code: z.string(),
});

const AttachCheckoutCustomerSchema = z.object({
  checkoutCustomerAttach: z
    .object({
      checkout: z
        .object({
          id: z.string(),
          user: z
            .object({
              id: z.string(),
              email: z.string(),
            })
            .nullable(),
        })
        .nullable(),
      errors: z.array(checkoutErrorSchema),
    })
    .nullable(),
});

const AttachCheckoutCustomerMutation = graphql(`
  mutation AttachSquareTestCustomer($checkoutId: ID!) {
    checkoutCustomerAttach(id: $checkoutId) {
      checkout {
        id
        user {
          id
          email
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`);

const AttachCheckoutCustomerParsingResponseError = BaseError.subclass(
  "AttachCheckoutCustomerParsingResponseError",
);

const getAttachErrorResult = (
  error:
    | z.infer<typeof checkoutErrorSchema>
    | { code?: string; field?: string | null; message?: string | null }
    | undefined,
) => ({
  status: "error" as const,
  error: {
    code: error?.code,
    field: error?.field,
    message: error?.message ?? "Saleor could not attach the checkout.",
  },
});

export const attachCheckoutCustomer = actionClient
  .schema(
    z.object({
      envUrl: envUrlSchema,
      checkoutId: z.string(),
      customerSession: customerSessionInputSchema,
    }),
  )
  .metadata({ actionName: "attachCheckoutCustomer" })
  .action(async ({ parsedInput: { envUrl, checkoutId, customerSession } }) => {
    const requestResult = await requestWithCustomerTokenRefresh({
      envUrl,
      document: AttachCheckoutCustomerMutation,
      variables: {
        checkoutId,
      },
      customerSession,
    });

    if (requestResult.status === "error") {
      return {
        ...getAttachErrorResult(requestResult.error),
        refreshedSession: null,
      };
    }

    const parsedResponse = AttachCheckoutCustomerSchema.safeParse(requestResult.response);

    if (parsedResponse.error) {
      throw AttachCheckoutCustomerParsingResponseError.normalize(parsedResponse.error);
    }

    const attachResult = parsedResponse.data.checkoutCustomerAttach;

    if (!attachResult) {
      return {
        ...getAttachErrorResult(undefined),
        refreshedSession: requestResult.refreshedSession,
      };
    }

    if (attachResult.errors.length > 0) {
      return {
        ...getAttachErrorResult(attachResult.errors[0]),
        refreshedSession: requestResult.refreshedSession,
      };
    }

    if (!attachResult.checkout?.user) {
      return {
        ...getAttachErrorResult(undefined),
        refreshedSession: requestResult.refreshedSession,
      };
    }

    revalidatePath(createPath("env", encodeURIComponent(envUrl), "checkout", checkoutId));

    return {
      status: "success" as const,
      checkoutId: attachResult.checkout.id,
      customer: attachResult.checkout.user,
      refreshedSession: requestResult.refreshedSession,
    };
  });
