"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { FullScreenLoader } from "@/components/full-screen-loader";
import { readFragment } from "@/graphql/gql";
import { BaseError } from "@/lib/errors";
import { StripePaymentStatus } from "@/modules/stripe/components/stripe-payment-status";
import { useCheckoutSummaryQuery } from "@/modules/stripe/use-checkout-summary-query";
import { Summary } from "@/modules/summary/components/summary";
import { CheckoutFragment } from "@/modules/summary/fragments";

const CheckoutSummaryPageError = BaseError.subclass("CheckoutSummaryPageError");

export default function CheckoutSummaryPage() {
  const { envUrl } = useParams<{
    envUrl: string;
    checkoutId: string;
    paymentGatewayId: string;
  }>();

  const decodedEnvUrl = decodeURIComponent(envUrl);

  const { isLoading, checkoutSummaryResponse, paymentGatewayInitializeResponse } =
    useCheckoutSummaryQuery();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!checkoutSummaryResponse) {
    throw new CheckoutSummaryPageError("No checkout data found");
  }

  const checkout = readFragment(CheckoutFragment, checkoutSummaryResponse?.checkout);

  if (!paymentGatewayInitializeResponse) {
    throw new BaseError("No data returned from the server");
  }

  const publishableKey = paymentGatewayInitializeResponse.data.stripePublishableKey;

  if (!publishableKey) {
    throw new BaseError("No publishable key returned from the server");
  }

  return (
    <main className="mx-auto grid max-w-6xl items-start gap-6 px-4 py-6 md:grid-cols-2 lg:gap-12">
      {checkout?.id ? (
        <div className="flex flex-col gap-6">
          <StripePaymentStatus publishableKey={publishableKey} />
          <Summary data={checkoutSummaryResponse.checkout} envUrl={decodedEnvUrl} />
        </div>
      ) : (
        <section>
          Checkout already completed - go to{" "}
          <Link href="/" className="underline">
            home page
          </Link>{" "}
          to create new one
        </section>
      )}
    </main>
  );
}
