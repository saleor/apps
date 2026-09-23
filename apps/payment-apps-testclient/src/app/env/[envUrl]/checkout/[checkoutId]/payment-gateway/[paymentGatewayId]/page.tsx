import { TotalPriceFragment } from "@/graphql/fragments";
import { readFragment } from "@/graphql/gql";
import { BaseError } from "@/lib/errors";
import { getCheckoutTotalPrice } from "@/modules/dropin/actions/get-checkout-total-price";
import { initalizePaymentGateway } from "@/modules/dropin/actions/initalize-payment-gateway";
import { AdyenDropin } from "@/modules/dropin/components/adyen-dropin";

const PaymentGatewayError = BaseError.subclass("PaymentGatewayError");

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

  const checkoutTotalPriceDataResponse = await getCheckoutTotalPrice({
    envUrl: decodedEnvUrl,
    checkoutId,
  });

  const totalPrice = readFragment(
    TotalPriceFragment,
    checkoutTotalPriceDataResponse?.data?.checkout?.totalPrice,
  );

  const initalizePaymentGatewayDataResponse = await initalizePaymentGateway({
    envUrl: decodedEnvUrl,
    checkoutId,
    paymentGatewayId: decodedPaymentGatewayId,
    amount: totalPrice?.gross.amount,
  });

  if (!initalizePaymentGatewayDataResponse?.data) {
    // Sends the error to the error boundary
    throw new PaymentGatewayError("No data returned from the server");
  }

  return (
    <AdyenDropin
      initalizePaymentGatewayData={initalizePaymentGatewayDataResponse?.data}
      totalPriceData={checkoutTotalPriceDataResponse?.data?.checkout?.totalPrice}
      envUrl={decodedEnvUrl}
      checkoutId={checkoutId}
      paymentGatewayId={decodedPaymentGatewayId}
    />
  );
}
