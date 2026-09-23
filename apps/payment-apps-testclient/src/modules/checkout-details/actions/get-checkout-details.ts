"use server";

import request from "graphql-request";
import { z } from "zod";

import { graphql } from "@/graphql/gql";
import { envUrlSchema } from "@/lib/env-url";
import { BaseError, UnknownError } from "@/lib/errors";
import { actionClient } from "@/lib/safe-action";

import { BillingAddressFragment } from "../fragments/billing-address";
import {
  CollectionPointFragment,
  DeliveryMethodFragment,
  ShippingMethodFragment,
} from "../fragments/delivery-method";
import { ShippingAddressFragment } from "../fragments/shipping";

const GetCheckoutQuery = graphql(
  `
    query getCheckout($checkoutId: ID!) {
      checkout(id: $checkoutId) {
        billingAddress {
          ...BillingAddress
        }
        shippingAddress {
          ...ShippingAddress
        }
        shippingMethods {
          ...ShippingMethod
        }
        deliveryMethod {
          ...DeliveryMethod
          ...CollectionPoint
        }
      }
    }
  `,
  [
    BillingAddressFragment,
    ShippingAddressFragment,
    ShippingMethodFragment,
    DeliveryMethodFragment,
    CollectionPointFragment,
  ],
);

export const getCheckoutDetails = actionClient
  .schema(
    z.object({
      checkoutId: z.string(),
      envUrl: envUrlSchema,
    }),
  )
  .metadata({ actionName: "getCheckoutDetails" })
  .action(async ({ parsedInput: { envUrl, checkoutId } }) => {
    const response = await request(envUrl, GetCheckoutQuery, {
      checkoutId,
    }).catch((error) => {
      throw BaseError.normalize(error, UnknownError);
    });

    return response;
  });
