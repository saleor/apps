import { useQueries } from "@tanstack/react-query";
import request from "graphql-request";
import { useParams } from "next/navigation";

import { GetCheckoutTotalPriceQuery } from "@/graphql/checkout-total-price";
import { BaseError, UnknownError } from "@/lib/errors";

import { createPaymentGatewayInitializeQuery } from "./payment-gateway-initialize-query";

const getCheckoutTotalPriceQuery = (args: { envUrl: string; checkoutId: string }) => ({
  queryKey: ["stripeCheckoutTotalPrice", args.envUrl, args.checkoutId],
  useErrorBoundary: true,
  queryFn: async () => {
    const response = await request(args.envUrl, GetCheckoutTotalPriceQuery, {
      checkoutId: args.checkoutId,
    }).catch((error) => {
      throw BaseError.normalize(error, UnknownError);
    });

    return response;
  },
});

export const useStripeDropinQuery = () => {
  const params = useParams<{
    envUrl: string;
    checkoutId: string;
    paymentGatewayId: string;
  }>();
  const envUrl = decodeURIComponent(params.envUrl);
  const checkoutId = decodeURIComponent(params.checkoutId);
  const paymentGatewayId = decodeURIComponent(params.paymentGatewayId);

  const [checkoutTotalQueryResponse, paymentGatewayInitializeQueryResponse] = useQueries({
    queries: [
      getCheckoutTotalPriceQuery({
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
      checkoutTotalQueryResponse.isLoading || paymentGatewayInitializeQueryResponse.isLoading,
    checkoutTotalResponse: checkoutTotalQueryResponse.data,
    paymentGatewayInitializeResponse: paymentGatewayInitializeQueryResponse.data,
  };
};
