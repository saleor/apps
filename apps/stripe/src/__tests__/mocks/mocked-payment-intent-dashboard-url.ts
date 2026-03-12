import { generatePaymentIntentStripeDashboardUrl } from "@/modules/stripe/generate-stripe-dashboard-urls";
import { type StripeEnv } from "@/modules/stripe/stripe-env";
import { type StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

import { mockedStripePaymentIntentId } from "./mocked-stripe-payment-intent-id";

type Params = {
  paymentIntentId?: StripePaymentIntentId;
  stripeEnv?: StripeEnv;
};

export const getMockedPaymentIntentDashboardUrl = (params?: Params) =>
  generatePaymentIntentStripeDashboardUrl(
    params?.paymentIntentId ?? mockedStripePaymentIntentId,
    params?.stripeEnv ?? "TEST",
  );
