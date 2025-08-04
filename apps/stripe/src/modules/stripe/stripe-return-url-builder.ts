import { z } from "zod";

/**
 * Builds the return URL for Stripe redirects after payment completion
 */
export class StripeReturnUrlBuilder {
  static ReturnUrlParamsSchema = z.object({
    checkoutUrl: z.string().url().optional(),
    orderId: z.string().optional(),
    appId: z.string(),
    saleorApiUrl: z.string().url(),
    channelId: z.string(),
  });

  static buildReturnUrl(
    appUrl: string,
    params: z.infer<typeof StripeReturnUrlBuilder.ReturnUrlParamsSchema>,
  ): string {
    const returnUrl = new URL("/api/stripe/return", appUrl);

    if (params.checkoutUrl) {
      returnUrl.searchParams.set("checkout_url", params.checkoutUrl);
    }

    if (params.orderId) {
      returnUrl.searchParams.set("order_id", params.orderId);
    }

    // Include app context for retrieving the payment intent later
    returnUrl.searchParams.set("app_id", params.appId);
    returnUrl.searchParams.set("saleor_api_url", params.saleorApiUrl);
    returnUrl.searchParams.set("channel_id", params.channelId);

    return returnUrl.toString();
  }
}
