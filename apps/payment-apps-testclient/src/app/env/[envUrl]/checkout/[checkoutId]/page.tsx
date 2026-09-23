import { getCheckoutDetails } from "@/modules/checkout-details/actions/get-checkout-details";
import { Billing } from "@/modules/checkout-details/components/billing";
import { DeliveryMethod } from "@/modules/checkout-details/components/delivery-method";
import { Shipping } from "@/modules/checkout-details/components/shipping";

export default async function CheckoutDetailsPage(props: {
  params: Promise<{ envUrl: string; checkoutId: string }>;
}) {
  const { envUrl, checkoutId } = await props.params;
  const decodedEnvUrl = decodeURIComponent(envUrl);

  const checkoutDetailsResponse = await getCheckoutDetails({
    envUrl: decodedEnvUrl,
    checkoutId,
  });

  const hasDeliveryMethodsToSelect =
    checkoutDetailsResponse?.data?.checkout?.shippingMethods?.length ?? 0;

  return (
    <main className="mx-auto grid max-w-6xl items-start gap-6 px-4 py-6 md:grid-cols-2 lg:gap-12">
      <Billing
        data={checkoutDetailsResponse?.data?.checkout?.billingAddress}
        envUrl={decodedEnvUrl}
        checkoutId={checkoutId}
      />
      <Shipping
        data={checkoutDetailsResponse?.data?.checkout?.shippingAddress}
        envUrl={decodedEnvUrl}
        checkoutId={checkoutId}
      />
      {hasDeliveryMethodsToSelect ? (
        <DeliveryMethod
          deliveryMethodData={checkoutDetailsResponse?.data?.checkout?.deliveryMethod}
          shippingMethodData={checkoutDetailsResponse?.data?.checkout?.shippingMethods}
          envUrl={decodedEnvUrl}
          checkoutId={checkoutId}
        />
      ) : null}
    </main>
  );
}
