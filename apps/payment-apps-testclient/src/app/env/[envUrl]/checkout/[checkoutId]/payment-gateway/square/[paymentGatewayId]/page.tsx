import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TotalPriceFragment } from "@/graphql/fragments";
import { readFragment } from "@/graphql/gql";
import { BaseError } from "@/lib/errors";
import { createPath } from "@/lib/utils";
import { getCheckoutTotalPrice } from "@/modules/square/actions/get-checkout-total-price";
import { initializePaymentGateway } from "@/modules/square/actions/initialize-payment-gateway";
import { SquareCheckout } from "@/modules/square/components/square-checkout";
import { isSquarePaymentGateway } from "@/modules/square/is-square-payment-gateway";

const PaymentGatewayError = BaseError.subclass("PaymentGatewayError");

const PaymentGatewayUnavailable = (props: {
  envUrl: string;
  checkoutId: string;
  gatewayId: string;
  error: {
    code?: string;
    field?: string | null;
    message: string;
  };
}) => {
  const { checkoutId, envUrl, error, gatewayId } = props;

  return (
    <main className="mx-auto grid max-w-3xl items-start gap-6 px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Square is not available</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">{error.message}</p>
          <dl className="grid gap-2 rounded-md bg-muted p-4">
            <div className="grid gap-1 sm:grid-cols-[120px_1fr]">
              <dt className="font-medium">Gateway</dt>
              <dd className="break-all">{gatewayId}</dd>
            </div>
            {error.code ? (
              <div className="grid gap-1 sm:grid-cols-[120px_1fr]">
                <dt className="font-medium">Saleor code</dt>
                <dd>{error.code}</dd>
              </div>
            ) : null}
            {error.field ? (
              <div className="grid gap-1 sm:grid-cols-[120px_1fr]">
                <dt className="font-medium">Field</dt>
                <dd>{error.field}</dd>
              </div>
            ) : null}
          </dl>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" asChild>
            <Link
              href={createPath(
                "env",
                encodeURIComponent(envUrl),
                "checkout",
                checkoutId,
                "payment-gateway",
              )}
            >
              Back to gateways
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};

export default async function PaymentGatewayPage({
  params,
}: {
  params: Promise<{
    envUrl: string;
    checkoutId: string;
    paymentGatewayId: string;
  }>;
}) {
  const { envUrl, checkoutId, paymentGatewayId } = await params;

  const decodedEnvUrl = decodeURIComponent(envUrl);
  const decodedPaymentGatewayId = decodeURIComponent(paymentGatewayId);

  if (!isSquarePaymentGateway(decodedPaymentGatewayId)) {
    throw new PaymentGatewayError(`Unsupported payment gateway: ${decodedPaymentGatewayId}`);
  }

  const [checkoutTotalPriceDataResponse, initializedGatewayResponse] = await Promise.all([
    getCheckoutTotalPrice({
      envUrl: decodedEnvUrl,
      checkoutId,
    }),
    initializePaymentGateway({
      envUrl: decodedEnvUrl,
      checkoutId,
      paymentGatewayId: decodedPaymentGatewayId,
    }),
  ]);

  const totalPrice = readFragment(
    TotalPriceFragment,
    checkoutTotalPriceDataResponse?.data?.checkout?.totalPrice,
  );

  if (!totalPrice) {
    throw new PaymentGatewayError("No checkout total returned from Saleor");
  }

  const channelSlug = checkoutTotalPriceDataResponse?.data?.checkout?.channel.slug;

  const checkoutContact = {
    email: checkoutTotalPriceDataResponse?.data?.checkout?.email,
    billingAddress: checkoutTotalPriceDataResponse?.data?.checkout?.billingAddress,
  };

  if (!channelSlug) {
    throw new PaymentGatewayError("No checkout channel returned from Saleor");
  }

  const initializedGateway = initializedGatewayResponse?.data;

  if (!initializedGateway) {
    throw new PaymentGatewayError("No Square config returned from Saleor");
  }

  if (initializedGateway.status === "error") {
    return (
      <PaymentGatewayUnavailable
        envUrl={decodedEnvUrl}
        checkoutId={checkoutId}
        gatewayId={decodedPaymentGatewayId}
        error={initializedGateway.error}
      />
    );
  }

  return (
    <SquareCheckout
      envUrl={decodedEnvUrl}
      checkoutId={checkoutId}
      paymentGatewayId={decodedPaymentGatewayId}
      channelSlug={channelSlug}
      checkoutContact={checkoutContact}
      totalPrice={totalPrice}
      squareConfig={initializedGateway.squareConfig}
    />
  );
}
