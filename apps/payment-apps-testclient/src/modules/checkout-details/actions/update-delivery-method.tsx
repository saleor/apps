"use server";

import request from "graphql-request";
import { z } from "zod";

import { graphql } from "@/graphql/gql";
import { envUrlSchema } from "@/lib/env-url";
import { BaseError, UnknownError } from "@/lib/errors";
import { actionClient } from "@/lib/safe-action";

import { redirectToPaymentGatewaySelect } from "./redirect-to-payment-gateway-select";

const UpdateDeliveryMethodSchema = z.object({
  checkoutDeliveryMethodUpdate: z.object({
    errors: z.array(
      z.object({
        field: z.string(),
        message: z.string(),
      }),
    ),
  }),
});

const UpdateDeliveryMethodMutation = graphql(`
  mutation checkoutDeliveryMethodUpdate($checkoutId: ID!, $input: ID!) {
    checkoutDeliveryMethodUpdate(id: $checkoutId, deliveryMethodId: $input) {
      errors {
        field
        message
      }
    }
  }
`);

const UpdateDeliveryMethodParsingResponseError = BaseError.subclass(
  "UpdateDeliveryMethodParsingResponseError",
);
const UpdateDeliveryMethodMutationError = BaseError.subclass("UpdateDeliveryMethodMutationError");

export const updateDeliveryMethod = actionClient
  .schema(
    z.object({
      envUrl: envUrlSchema,
      checkoutId: z.string(),
      deliveryMethod: z.string(),
    }),
  )
  .metadata({ actionName: "updateDeliveryMethod" })
  .action(
    async ({ parsedInput: { envUrl, checkoutId, deliveryMethod } }) => {
      const response = await request(envUrl, UpdateDeliveryMethodMutation, {
        checkoutId,
        input: deliveryMethod,
      }).catch((error) => {
        throw BaseError.normalize(error, UnknownError);
      });

      const parsedResponse = UpdateDeliveryMethodSchema.safeParse(response);

      if (!parsedResponse.success) {
        throw UpdateDeliveryMethodParsingResponseError.normalize(parsedResponse.error);
      }

      if (parsedResponse.data.checkoutDeliveryMethodUpdate.errors.length > 0) {
        throw new UpdateDeliveryMethodMutationError(
          "Failed to create checkout - errors in createCheckout mutation.",
          {
            errors: parsedResponse.data.checkoutDeliveryMethodUpdate.errors.map((e) =>
              UpdateDeliveryMethodMutationError.normalize(e),
            ),
          },
        );
      }

      return parsedResponse.data;
    },
    {
      onSuccess: async ({ parsedInput }) => {
        await redirectToPaymentGatewaySelect({
          checkoutId: parsedInput.checkoutId,
        });
      },
    },
  );
