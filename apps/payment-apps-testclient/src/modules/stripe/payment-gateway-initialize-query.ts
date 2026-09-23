import request from "graphql-request";
import { z } from "zod";

import { graphql } from "@/graphql/gql";
import { BaseError, UnknownError } from "@/lib/errors";

const InitializePaymentGatewayMutation = graphql(`
  mutation InitializePaymentGateway(
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

const InitializePaymentGatewayError = BaseError.subclass("InitializePaymentGatewayError");

const saleorDataSchema = z.object({
  stripePublishableKey: z.string(),
});

export const createPaymentGatewayInitializeQuery = (args: {
  envUrl: string;
  checkoutId: string;
  paymentGatewayId: string;
  amount?: number;
  data?: unknown;
}) => ({
  queryKey: [
    "stripePaymentGatewayInitialize",
    args.envUrl,
    args.checkoutId,
    args.paymentGatewayId,
    args.amount,
    args.data,
  ],
  useErrorBoundary: true,
  queryFn: async () => {
    const response = await request(args.envUrl, InitializePaymentGatewayMutation, {
      checkoutId: args.checkoutId,
      paymentGatewayId: args.paymentGatewayId,
      amount: args.amount,
      data: args.data,
    }).catch((error) => {
      throw BaseError.normalize(error, UnknownError);
    });

    if (response.paymentGatewayInitialize?.gatewayConfigs?.length !== 1) {
      throw new InitializePaymentGatewayError("More than one gateway config found");
    }

    const config = response.paymentGatewayInitialize?.gatewayConfigs[0];

    if (!config) {
      throw new InitializePaymentGatewayError("Gateway config is not defined");
    }

    if ((config.errors ?? []).length > 0) {
      throw new InitializePaymentGatewayError("Errors in initializePaymentGateway mutation", {
        errors: config.errors?.map((e) => InitializePaymentGatewayError.normalize(e)),
      });
    }

    const parsedSaleorDataResult = saleorDataSchema.safeParse(config.data);

    if (parsedSaleorDataResult.success) {
      return {
        ...config,
        data: parsedSaleorDataResult.data,
      };
    }

    throw new InitializePaymentGatewayError(
      "Failed to parse initializePaymentGateway mutation response",
      {
        errors: parsedSaleorDataResult.error.errors,
      },
    );
  },
});
