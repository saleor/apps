import Link from "next/link";

import { readFragment } from "@/graphql/gql";
import { BaseError } from "@/lib/errors";
import { getCheckoutSummary } from "@/modules/summary/actions/get-checkout-summary";
import { Summary } from "@/modules/summary/components/summary";
import { CheckoutFragment } from "@/modules/summary/fragments";

const CheckoutSummaryPageError = BaseError.subclass("CheckoutSummaryPageError");

export default async function CheckoutSummaryPage({
  params,
}: {
  params: Promise<{ envUrl: string; checkoutId: string }>;
}) {
  const { envUrl, checkoutId } = await params;
  const decodedEnvUrl = decodeURIComponent(envUrl);
  const checkoutSummaryDataResponse = await getCheckoutSummary({
    envUrl: decodedEnvUrl,
    checkoutId,
  });

  if (!checkoutSummaryDataResponse?.data) {
    throw new CheckoutSummaryPageError("No checkout data found");
  }

  const checkout = readFragment(CheckoutFragment, checkoutSummaryDataResponse.data.checkout);

  return (
    <main className="mx-auto grid max-w-6xl items-start gap-6 px-4 py-6 md:grid-cols-2 lg:gap-12">
      {checkout?.id ? (
        <Summary data={checkoutSummaryDataResponse.data.checkout} envUrl={decodedEnvUrl} />
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
