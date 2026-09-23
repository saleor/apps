"use server";

import request from "graphql-request";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { graphql } from "@/graphql/gql";
import { envUrlSchema } from "@/lib/env-url";
import { BaseError, UnknownError } from "@/lib/errors";
import { actionClient } from "@/lib/safe-action";
import { createPath } from "@/lib/utils";

import { BillingAddressSchema } from "../schemas/billing-address";

const UpdateBillingAddressSchema = z.object({
  checkoutBillingAddressUpdate: z.object({
    errors: z.array(
      z.object({
        field: z.string(),
        message: z.string(),
      }),
    ),
  }),
});

const UpdateBillingAddressMutation = graphql(`
  mutation updateBillingAddress($checkoutId: ID!, $input: AddressInput!) {
    checkoutBillingAddressUpdate(id: $checkoutId, billingAddress: $input) {
      errors {
        field
        message
      }
    }
  }
`);

const UpdateBillingAddressParsingResponseError = BaseError.subclass(
  "UpdateBillingAddressParsingResponseError",
);
const UpdateBillingAddressMutationError = BaseError.subclass("UpdateBillingAddressMutationError");

export const updateBillingAddress = actionClient
  .schema(
    z.object({
      envUrl: envUrlSchema,
      checkoutId: z.string(),
      billingAddress: BillingAddressSchema,
    }),
  )
  .metadata({ actionName: "updateBillingAddress" })
  .action(async ({ parsedInput: { envUrl, checkoutId, billingAddress } }) => {
    const response = await request(envUrl, UpdateBillingAddressMutation, {
      checkoutId,
      input: billingAddress,
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Failed to update billing address", { error });
      throw BaseError.normalize(error, UnknownError);
    });

    const parsedResponse = UpdateBillingAddressSchema.safeParse(response);

    if (!parsedResponse.success) {
      throw UpdateBillingAddressParsingResponseError.normalize(parsedResponse.error);
    }

    if (parsedResponse.data.checkoutBillingAddressUpdate.errors.length > 0) {
      throw new UpdateBillingAddressMutationError(
        "Failed to create checkout - errors in createCheckout mutation.",
        {
          errors: parsedResponse.data.checkoutBillingAddressUpdate.errors.map((e) =>
            UpdateBillingAddressMutationError.normalize(e),
          ),
        },
      );
    }
    revalidatePath(createPath("env", encodeURIComponent(envUrl), "checkout", checkoutId));

    return parsedResponse.data;
  });
