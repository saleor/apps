"use server";

import request from "graphql-request";
import { z } from "zod";

import { graphql } from "@/graphql/gql";
import { envUrlSchema } from "@/lib/env-url";
import { BaseError, UnknownError } from "@/lib/errors";
import { actionClient } from "@/lib/safe-action";

import { redirectToCheckoutDetails } from "./redirect-to-checkout-details";

const CreateCheckoutSchema = z.object({
  checkoutCreate: z.object({
    checkout: z
      .object({
        id: z.string(),
      })
      .nullable(),
    errors: z.array(
      z.object({
        field: z.string(),
        message: z.string(),
      }),
    ),
  }),
});

const CreateCheckoutMutation = graphql(`
  mutation createCheckout($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) {
      checkout {
        id
      }
      errors {
        field
        message
      }
    }
  }
`);

const CreateCheckoutParsingResponseError = BaseError.subclass("CreateCheckoutParsingResponseError");
const CreateCheckoutMutationError = BaseError.subclass("CreateCheckoutMutationError");

export const createCheckout = actionClient
  .schema(
    z.object({
      envUrl: envUrlSchema,
      channelSlug: z.string(),
      variantId: z.string(),
    }),
  )
  .metadata({ actionName: "createCheckout" })
  .action(
    async ({ parsedInput: { channelSlug, envUrl, variantId } }) => {
      const response = await request(envUrl, CreateCheckoutMutation, {
        input: {
          channel: channelSlug,
          email: "adyen-testclient@saleor.io",
          lines: [
            {
              variantId,
              quantity: 1,
            },
          ],
        },
      }).catch((error) => {
        throw BaseError.normalize(error, UnknownError);
      });

      const parsedResponse = CreateCheckoutSchema.safeParse(response);

      if (!parsedResponse.success) {
        throw CreateCheckoutParsingResponseError.normalize(parsedResponse.error);
      }

      if (parsedResponse.data.checkoutCreate.errors.length > 0) {
        throw new CreateCheckoutMutationError(
          "Failed to create checkout - errors in createCheckout mutation.",
          {
            errors: parsedResponse.data.checkoutCreate.errors.map((e) =>
              CreateCheckoutMutationError.normalize(e),
            ),
          },
        );
      }

      return parsedResponse.data;
    },
    {
      onSuccess: async ({ data, parsedInput }) => {
        await redirectToCheckoutDetails({
          envUrl: parsedInput.envUrl,
          checkoutId: data?.checkoutCreate.checkout?.id,
        });
      },
    },
  );
