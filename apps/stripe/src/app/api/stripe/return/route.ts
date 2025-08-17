// import { createSaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createLogger } from "@/lib/logger";
import { appConfigRepoImpl } from "@/modules/app-config/repositories/app-config-repo-impl";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { StripePaymentIntentsApiFactory } from "@/modules/stripe/stripe-payment-intents-api-factory";
import { transactionRecorder } from "@/modules/transactions-recording/repositories/transaction-recorder-impl";

const logger = createLogger("StripeReturnRoute");

const ReturnParamsSchema = z.object({
  payment_intent: z.string(),
  // payment_intent_client_secret: z.string(),
  redirect_status: z.enum(["succeeded", "processing", "requires_payment_method"]).optional(),
  source_redirect_slug: z.string().optional(),
  app_id: z.string(),
  saleor_api_url: z.string().url(),
  channel_id: z.string(),
  checkout_url: z.string().url().optional(),
  order_id: z.string().optional(),
});

export async function GET(request: NextRequest) {
  logger.debug("Stripe return endpoint called");

  const searchParams = request.nextUrl.searchParams;
  const params: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const parseResult = ReturnParamsSchema.safeParse(params);

  if (!parseResult.success) {
    logger.error("Invalid return parameters", { error: parseResult.error });

    return NextResponse.redirect(new URL("/payment-error?error=invalid_parameters", request.url));
  }

  const {
    payment_intent,
    redirect_status,
    app_id,
    saleor_api_url,
    channel_id,
    checkout_url,
    order_id,
  } = parseResult.data;

  try {
    const stripePaymentIntentId = createStripePaymentIntentId(payment_intent);

    // Parse Saleor API URL
    const saleorApiUrlResult = createSaleorApiUrl(saleor_api_url);

    if (saleorApiUrlResult.isErr()) {
      logger.error("Invalid Saleor API URL", { error: saleorApiUrlResult.error });

      return NextResponse.redirect(new URL("/payment-error?error=invalid_api_url", request.url));
    }

    // Get the transaction record to verify it exists
    const transactionRecord = await transactionRecorder.getTransactionByStripePaymentIntentId(
      { appId: app_id, saleorApiUrl: saleorApiUrlResult.value },
      stripePaymentIntentId,
    );

    if (transactionRecord.isErr()) {
      logger.error("Failed to find transaction record", {
        error: transactionRecord.error,
        paymentIntentId: stripePaymentIntentId,
      });

      return NextResponse.redirect(
        new URL("/payment-error?error=transaction_not_found", request.url),
      );
    }

    // Get the Stripe configuration for this channel
    const stripeConfig = await appConfigRepoImpl.getStripeConfig({
      channelId: channel_id,
      appId: app_id,
      saleorApiUrl: saleorApiUrlResult.value,
    });

    if (stripeConfig.isErr() || !stripeConfig.value) {
      logger.error("Failed to get Stripe configuration", {
        error: stripeConfig.isErr() ? stripeConfig.error : "Config not found",
        channelId: channel_id,
      });

      return NextResponse.redirect(
        new URL("/payment-error?error=configuration_error", request.url),
      );
    }

    // Create Stripe API client and retrieve the payment intent
    const stripePaymentIntentsApi = new StripePaymentIntentsApiFactory().create({
      key: stripeConfig.value.restrictedKey,
    });

    const paymentIntentResult = await stripePaymentIntentsApi.getPaymentIntent({
      id: stripePaymentIntentId,
    });

    if (paymentIntentResult.isErr()) {
      logger.error("Failed to retrieve payment intent", {
        error: paymentIntentResult.error,
      });

      return NextResponse.redirect(
        new URL("/payment-error?error=payment_intent_not_found", request.url),
      );
    }

    const paymentIntent = paymentIntentResult.value;

    logger.info("Payment return processed", {
      paymentIntentId: stripePaymentIntentId,
      redirectStatus: redirect_status,
      paymentIntentStatus: paymentIntent.status,
      metadata: paymentIntent.metadata,
    });

    // Use the checkout URL or order ID from the return URL parameters
    const checkoutUrlParam = checkout_url;
    const orderIdParam = order_id || paymentIntent.metadata?.saleor_source_id;

    // Determine the redirect URL based on payment status
    let redirectUrl: URL;

    if (paymentIntent.status === "succeeded" || paymentIntent.status === "processing") {
      // Payment successful - redirect to order confirmation
      if (checkoutUrlParam) {
        redirectUrl = new URL(checkoutUrlParam);
        redirectUrl.searchParams.set("payment_status", "success");
      } else if (orderIdParam) {
        // Fallback to order page
        redirectUrl = new URL(`/order/${orderIdParam}`, request.url);
        redirectUrl.searchParams.set("payment_status", "success");
      } else {
        // Generic success page
        redirectUrl = new URL("/payment-success", request.url);
      }
    } else if (
      paymentIntent.status === "requires_payment_method" ||
      paymentIntent.status === "canceled"
    ) {
      // Payment failed - redirect back to checkout
      if (checkoutUrlParam) {
        redirectUrl = new URL(checkoutUrlParam);
        redirectUrl.searchParams.set("payment_status", "failed");
        redirectUrl.searchParams.set("error", "payment_failed");
      } else {
        // Generic error page
        redirectUrl = new URL("/payment-error", request.url);
        redirectUrl.searchParams.set("error", "payment_failed");
      }
    } else {
      // Unexpected status
      logger.warn("Unexpected payment intent status", { status: paymentIntent.status });
      redirectUrl = new URL("/payment-error", request.url);
      redirectUrl.searchParams.set("error", "unexpected_status");
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    logger.error("Error processing payment return", { error: String(error) });

    return NextResponse.redirect(new URL("/payment-error?error=processing_failed", request.url));
  }
}
