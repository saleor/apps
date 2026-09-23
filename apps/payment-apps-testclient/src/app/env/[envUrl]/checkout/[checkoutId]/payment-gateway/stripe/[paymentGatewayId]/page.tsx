"use client";

import { readFragment } from "gql.tada";
import { useParams } from "next/navigation";

import { FullScreenLoader } from "@/components/full-screen-loader";
import { TotalPriceFragment } from "@/graphql/fragments";
import { BaseError } from "@/lib/errors";
import { StripeCheckoutForm } from "@/modules/stripe/components/stripe-checkout-form";
import { useStripeDropinQuery } from "@/modules/stripe/use-stripe-dropin-query";

export default function StripeDropinPage() {
  const { envUrl, checkoutId, paymentGatewayId } = useParams<{
    envUrl: string;
    checkoutId: string;
    paymentGatewayId: string;
  }>();

  const decodedEnvUrl = decodeURIComponent(envUrl);
  const decodedPaymentGatewayId = decodeURIComponent(paymentGatewayId);

  const { isLoading, checkoutTotalResponse, paymentGatewayInitializeResponse } =
    useStripeDropinQuery();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  const publishableKey = paymentGatewayInitializeResponse?.data.stripePublishableKey;

  if (!publishableKey) {
    throw new BaseError("No publishable key returned from the server");
  }

  const totalPrice = readFragment(TotalPriceFragment, checkoutTotalResponse?.checkout?.totalPrice);

  if (!totalPrice?.gross.amount) {
    throw new BaseError("Amount empty");
  }

  return (
    <div className="m-auto my-10 max-w-lg">
      <StripeCheckoutForm
        pk={publishableKey}
        totalPrice={totalPrice}
        currency={totalPrice?.gross.currency.toLowerCase()}
        checkoutId={checkoutId}
        envUrl={decodedEnvUrl}
        paymentGatewayId={decodedPaymentGatewayId}
      />
    </div>
  );
}
