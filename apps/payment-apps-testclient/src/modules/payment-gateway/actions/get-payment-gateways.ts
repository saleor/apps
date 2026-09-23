"use server";

import request from "graphql-request";
import { z } from "zod";

import { graphql } from "@/graphql/gql";
import { envUrlSchema } from "@/lib/env-url";
import { BaseError, UnknownError } from "@/lib/errors";
import { actionClient } from "@/lib/safe-action";

import { PaymentGatewayFragment, TotalPriceFragment } from "../fragments";

const GetPaymentGatewaysQuery = graphql(
  `
    query GetPaymentGateways($checkoutId: ID!) {
      checkout(id: $checkoutId) {
        totalPrice {
          ...TotalPrice
        }
        availablePaymentGateways {
          ...PaymentGateway
        }
      }
    }
  `,
  [TotalPriceFragment, PaymentGatewayFragment],
);

export const getPaymentGateways = actionClient
  .schema(
    z.object({
      checkoutId: z.string(),
      envUrl: envUrlSchema,
    }),
  )
  .metadata({ actionName: "getPaymentGateways" })
  .action(async ({ parsedInput: { envUrl, checkoutId } }) => {
    const response = await request(envUrl, GetPaymentGatewaysQuery, {
      checkoutId,
    }).catch((error) => {
      throw BaseError.normalize(error, UnknownError);
    });

    return response;
  });
