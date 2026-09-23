"use server";

import request from "graphql-request";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { graphql } from "@/graphql/gql";
import { envUrlSchema } from "@/lib/env-url";
import { BaseError, UnknownError } from "@/lib/errors";
import { actionClient } from "@/lib/safe-action";
import { createPath } from "@/lib/utils";

import { ShippingAddressSchema } from "../schemas/shipping-address";

const UpdateShippingAddressSchema = z.object({
  checkoutShippingAddressUpdate: z.object({
    errors: z.array(
      z.object({
        field: z.string(),
        message: z.string(),
      }),
    ),
  }),
});

const UpdateShippingAddressMutation = graphql(`
  mutation updateShippingAddress($checkoutId: ID!, $input: AddressInput!) {
    checkoutShippingAddressUpdate(id: $checkoutId, shippingAddress: $input) {
      errors {
        field
        message
      }
    }
  }
`);

const UpdateShippingAddressParsingResponseError = BaseError.subclass(
  "UpdateShippingAddressParsingResponseError",
);
const UpdateShippingAddressMutationError = BaseError.subclass("UpdateShippingAddressMutationError");

export const updateShippingAddress = actionClient
  .schema(
    z.object({
      envUrl: envUrlSchema,
      checkoutId: z.string(),
      shippingAddress: ShippingAddressSchema,
    }),
  )
  .metadata({ actionName: "updateShippingAddress" })
  .action(async ({ parsedInput: { envUrl, checkoutId, shippingAddress } }) => {
    const response = await request(envUrl, UpdateShippingAddressMutation, {
      checkoutId,
      input: shippingAddress,
    }).catch((error) => {
      throw BaseError.normalize(error, UnknownError);
    });

    const parsedResponse = UpdateShippingAddressSchema.safeParse(response);

    if (!parsedResponse.success) {
      throw UpdateShippingAddressParsingResponseError.normalize(parsedResponse.error);
    }

    if (parsedResponse.data.checkoutShippingAddressUpdate.errors.length > 0) {
      throw new UpdateShippingAddressMutationError(
        "Failed to create checkout - errors in createCheckout mutation.",
        {
          errors: parsedResponse.data.checkoutShippingAddressUpdate.errors.map((e) =>
            UpdateShippingAddressMutationError.normalize(e),
          ),
        },
      );
    }

    revalidatePath(createPath("env", encodeURIComponent(envUrl), "checkout", checkoutId));

    return parsedResponse.data;
  });
