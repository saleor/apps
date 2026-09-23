"use server";

import request from "graphql-request";
import { z } from "zod";

import { graphql } from "@/graphql/gql";
import { envUrlSchema } from "@/lib/env-url";
import { BaseError, UnknownError } from "@/lib/errors";
import { actionClient } from "@/lib/safe-action";

import { InitalizePaymentGatewaySchema } from "../schemas/initalize-payment-gateway";

const InitalizePaymentGatewayMutation = graphql(`
  mutation initalizePaymentGateway(
    $checkoutId: ID!
    $paymentGatewayId: String!
    $amount: PositiveDecimal
    $data: JSON
  ) {
    paymentGatewayInitialize(
      id: $checkoutId
      paymentGateways: [{ id: $paymentGatewayId, data: $data }]
      amount: $amount
    ) {
      gatewayConfigs {
        id
        data
        errors {
          field
          message
          code
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

const InitalizePaymentGatewayParsingResponseError = BaseError.subclass(
  "InitalizePaymentGatewayParsingResponseError",
);
const InitalizePaymentGatewayMutationError = BaseError.subclass(
  "InitalizePaymentGatewayMutationError",
);

export const initalizePaymentGateway = actionClient
  .schema(
    z.object({
      checkoutId: z.string(),
      envUrl: envUrlSchema,
      paymentGatewayId: z.string(),
      amount: z.number().optional(),
      data: z
        .discriminatedUnion("action", [
          z.object({
            action: z.literal("checkBalance"),
            paymentMethod: z.object({
              type: z.literal("giftcard"),
              brand: z.string(),
              encryptedCardNumber: z.string(),
              encryptedSecurityCode: z.string(),
            }),
          }),
          z.object({
            action: z.literal("createOrder"),
          }),
          z.object({
            action: z.literal("cancelOrder"),
            pspReference: z.string(),
            orderData: z.string(),
          }),
        ])
        .optional(),
    }),
  )
  .metadata({
    actionName: "initalizePaymentGateway",
  })
  .action(async ({ parsedInput: { envUrl, checkoutId, paymentGatewayId, amount, data } }) => {
    const response = await request(envUrl, InitalizePaymentGatewayMutation, {
      checkoutId,
      paymentGatewayId,
      amount,
      data,
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch payment", { error });
      throw BaseError.normalize(error, UnknownError);
    });

    const parsedResponse = InitalizePaymentGatewaySchema.passthrough().safeParse(response);

    if (!parsedResponse.success) {
      throw InitalizePaymentGatewayParsingResponseError.normalize(parsedResponse.error);
    }

    if (parsedResponse.data.paymentGatewayInitialize.errors.length > 0) {
      throw new InitalizePaymentGatewayMutationError(
        "Failed to initalize payment gateway - errors in initalizePaymentGateway mutation",
        {
          errors: parsedResponse.data.paymentGatewayInitialize.errors.map((e) =>
            InitalizePaymentGatewayMutationError.normalize(e),
          ),
        },
      );
    }

    if (
      parsedResponse.data.paymentGatewayInitialize.gatewayConfigs.some(
        (config) => config.errors.length > 0,
      )
    ) {
      throw new InitalizePaymentGatewayMutationError(
        "Failed to initalize payment gateway - errors in initalizePaymentGateway configurations",
        {
          errors: parsedResponse.data.paymentGatewayInitialize.gatewayConfigs,
        },
      );
    }

    return parsedResponse.data;
  });
