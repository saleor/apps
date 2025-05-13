import { generateRefundStripeDashboardUrl } from "@/modules/stripe/generate-stripe-dashboard-urls";
import { StripeEnv } from "@/modules/stripe/stripe-env";
import { StripeRefundId } from "@/modules/stripe/stripe-refund-id";

import { mockedStripeRefundId } from "./mocked-stripe-refund-id";

type Params = {
  refundId?: StripeRefundId;
  stripeEnv?: StripeEnv;
};

export const getMockedRefundDashboardUrl = (params?: Params) =>
  generateRefundStripeDashboardUrl(
    params?.refundId ?? mockedStripeRefundId,
    params?.stripeEnv ?? "LIVE",
  );
