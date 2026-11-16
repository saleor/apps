"use server";

import request from "graphql-request";
import { z } from "zod";

import { graphql } from "@/graphql/gql";
import { envUrlSchema } from "@/lib/env-url";
import { BaseError, UnknownError } from "@/lib/errors";
import { actionClient } from "@/lib/safe-action";
import { saleorRequestHeaders } from "@/lib/saleor-request-headers";

import { SquareGatewayConfigSchema } from "../schemas/square-gateway-config";

const initializePaymentGatewayMutation = graphql(`
  mutation InitializePaymentGateway(
    $checkoutId: ID!
    $paymentGatewayId: String!
    $amount: PositiveDecimal
  ) {
    paymentGatewayInitialize(
      id: $checkoutId
      amount: $amount
      paymentGateways: [{ id: $paymentGatewayId }]
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

const gatewayErrorSchema = z.object({
  field: z.string().nullable(),
  message: z.string().nullable(),
  code: z.string(),
});

const InitializePaymentGatewaySchema = z.object({
  paymentGatewayInitialize: z
    .object({
      gatewayConfigs: z
        .array(
          z.object({
            id: z.string(),
            data: z.unknown().nullable(),
            errors: z.array(gatewayErrorSchema).nullable(),
          }),
        )
        .nullable(),
      errors: z.array(gatewayErrorSchema),
    })
    .nullable(),
});

const InitializePaymentGatewayParsingResponseError = BaseError.subclass(
  "InitializePaymentGatewayParsingResponseError",
);

type GatewayError = z.infer<typeof gatewayErrorSchema>;

const getGatewayErrorResult = (error: GatewayError | undefined, fallbackMessage: string) => ({
  status: "error" as const,
  error: {
    code: error?.code,
    field: error?.field,
    message: error?.message ?? fallbackMessage,
  },
});

export const initializePaymentGateway = actionClient
  .schema(
    z.object({
      envUrl: envUrlSchema,
      checkoutId: z.string(),
      paymentGatewayId: z.string(),
      amount: z.number().optional(),
    }),
  )
  .metadata({ actionName: "initializePaymentGateway" })
  .action(async ({ parsedInput: { envUrl, checkoutId, paymentGatewayId, amount } }) => {
    const response = await request(
      envUrl,
      initializePaymentGatewayMutation,
      {
        checkoutId,
        paymentGatewayId,
        amount,
      },
      saleorRequestHeaders,
    ).catch((error) => {
      throw BaseError.normalize(error, UnknownError);
    });
    const parsedResponse = InitializePaymentGatewaySchema.safeParse(response);

    if (parsedResponse.error) {
      throw InitializePaymentGatewayParsingResponseError.normalize(parsedResponse.error);
    }

    const initializedGateway = parsedResponse.data.paymentGatewayInitialize;

    if (!initializedGateway) {
      return getGatewayErrorResult(
        undefined,
        "Saleor did not return a payment gateway initialization response.",
      );
    }

    if (initializedGateway.errors.length > 0) {
      return getGatewayErrorResult(
        initializedGateway.errors[0],
        "Saleor could not initialize the payment gateway.",
      );
    }

    const squareGateway = initializedGateway.gatewayConfigs?.find(
      (gatewayConfig) => gatewayConfig.id === paymentGatewayId,
    );

    if (!squareGateway) {
      return getGatewayErrorResult(
        undefined,
        `Saleor did not return config for ${paymentGatewayId}.`,
      );
    }

    if (squareGateway.errors?.length) {
      return getGatewayErrorResult(
        squareGateway.errors[0],
        "Square gateway config contains errors.",
      );
    }

    const parsedGatewayConfig = SquareGatewayConfigSchema.safeParse(squareGateway.data);

    if (parsedGatewayConfig.error) {
      throw InitializePaymentGatewayParsingResponseError.normalize(parsedGatewayConfig.error);
    }

    return {
      status: "success" as const,
      squareConfig: parsedGatewayConfig.data,
    };
  });
