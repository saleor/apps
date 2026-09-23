import { useQueries } from "@tanstack/react-query";
import { graphql } from "gql.tada";
import request from "graphql-request";
import { useParams } from "next/navigation";

import { BaseError, UnknownError } from "@/lib/errors";

import { CheckoutFragment } from "../summary/fragments";
import { createPaymentGatewayInitializeQuery } from "./payment-gateway-initialize-query";

const GetCheckoutSummaryQuery = graphql(
  `
    query GetCheckoutSummary($checkoutId: ID!) {
      checkout(id: $checkoutId) {
        ...Checkout
      }
    }
  `,
  [CheckoutFragment],
);

const createGetCheckoutSummaryQuery = (args: { envUrl: string; checkoutId: string }) => ({
  queryKey: ["checkoutSummary", args.envUrl, args.checkoutId],
  useErrorBoundary: true,
  queryFn: async () => {
    const response = await request(args.envUrl, GetCheckoutSummaryQuery, {
      checkoutId: args.checkoutId,
    }).catch((error) => {
      throw BaseError.normalize(error, UnknownError);
    });

    return response;
  },
});

export const useCheckoutSummaryQuery = () => {
  const params = useParams<{
    envUrl: string;
    checkoutId: string;
    paymentGatewayId: string;
  }>();
  const envUrl = decodeURIComponent(params.envUrl);
  const checkoutId = decodeURIComponent(params.checkoutId);
  const paymentGatewayId = decodeURIComponent(params.paymentGatewayId);

  const [checkoutSummaryQueryResponse, paymentGatewayInitializeQueryResponse] = useQueries({
    queries: [
      createGetCheckoutSummaryQuery({
        envUrl,
        checkoutId,
      }),
      createPaymentGatewayInitializeQuery({
        envUrl,
        checkoutId,
        paymentGatewayId,
      }),
    ],
  });

  return {
    isLoading:
      checkoutSummaryQueryResponse.isLoading || paymentGatewayInitializeQueryResponse.isLoading,
    checkoutSummaryResponse: checkoutSummaryQueryResponse.data,
    paymentGatewayInitializeResponse: paymentGatewayInitializeQueryResponse.data,
  };
};
