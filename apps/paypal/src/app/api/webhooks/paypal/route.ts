import { captureException } from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
import { getPool } from "@/lib/database";
import { PostgresMerchantOnboardingRepository } from "@/modules/merchant-onboarding/merchant-onboarding-repository";
import { GlobalPayPalConfigRepository } from "@/modules/wsm-admin/global-paypal-config-repository";
import { PayPalPartnerReferralsApiFactory } from "@/modules/paypal/partner-referrals/paypal-partner-referrals-api-factory";

const logger = createLogger("PayPalWebhookHandler");

/**
 * PayPal Webhook Event Types
 */
type PayPalWebhookEvent = {
  id: string;
  event_type: string;
  event_version: string;
  create_time: string;
  resource_type: string;
  resource_version?: string;
  resource: any;
  summary: string;
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
};

/**
 * Handle MERCHANT.ONBOARDING.COMPLETED webhook
 * Updates merchant status when onboarding is completed via PayPal
 */
async function handleMerchantOnboardingCompleted(event: PayPalWebhookEvent) {
  logger.info("Processing MERCHANT.ONBOARDING.COMPLETED webhook", {
    event_id: event.id,
    resource_type: event.resource_type,
  });

  const resource = event.resource;
  const merchantId = resource.merchant_id;
  const trackingId = resource.tracking_id;

  if (!merchantId || !trackingId) {
    logger.error("Missing required fields in webhook", {
      event_id: event.id,
      has_merchant_id: !!merchantId,
      has_tracking_id: !!trackingId,
    });
    return;
  }

  logger.info("Merchant onboarding completed", {
    merchant_id: merchantId,
    tracking_id: trackingId,
  });

  // Update merchant record in database
  const pool = getPool();
  const repository = PostgresMerchantOnboardingRepository.create(pool);

  // Find the merchant record by tracking_id
  // Since we don't have saleorApiUrl in the webhook, we'll need to find it
  // This is a limitation - we may need to store webhook metadata differently
  // For now, we'll log this and handle it in the refresh status endpoint

  logger.info("Merchant onboarding completed via webhook - refresh status to complete", {
    merchant_id: merchantId,
    tracking_id: trackingId,
  });
}

/**
 * Handle MERCHANT.PARTNER-CONSENT.REVOKED webhook
 * Marks merchant as disconnected when they revoke partner consent
 */
async function handleMerchantConsentRevoked(event: PayPalWebhookEvent) {
  logger.info("Processing MERCHANT.PARTNER-CONSENT.REVOKED webhook", {
    event_id: event.id,
    resource_type: event.resource_type,
  });

  const resource = event.resource;
  const merchantId = resource.merchant_id;

  if (!merchantId) {
    logger.error("Missing merchant_id in webhook", {
      event_id: event.id,
    });
    return;
  }

  logger.warn("Merchant revoked partner consent", {
    merchant_id: merchantId,
  });

  // Update merchant status to revoked
  // Similar limitation as above - need to find merchant by merchant_id across all tenants
  logger.info("Merchant consent revoked - should update status to REVOKED", {
    merchant_id: merchantId,
  });
}

/**
 * PayPal Webhook Handler
 * Receives and processes PayPal webhook events
 */
async function PayPalWebhookHandler(request: NextRequest): Promise<Response> {
  try {
    // Parse webhook body
    const body = await request.text();
    let event: PayPalWebhookEvent;

    try {
      event = JSON.parse(body);
    } catch (parseError) {
      logger.error("Failed to parse webhook body", {
        error: parseError,
      });
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    logger.info("Received PayPal webhook", {
      event_id: event.id,
      event_type: event.event_type,
      resource_type: event.resource_type,
    });

    // TODO: Verify webhook signature
    // PayPal provides webhook signature verification
    // Reference: https://developer.paypal.com/api/rest/webhooks/

    // Route to appropriate handler based on event type
    switch (event.event_type) {
      case "MERCHANT.ONBOARDING.COMPLETED":
        await handleMerchantOnboardingCompleted(event);
        break;

      case "MERCHANT.PARTNER-CONSENT.REVOKED":
        await handleMerchantConsentRevoked(event);
        break;

      default:
        logger.info("Unhandled webhook event type", {
          event_id: event.id,
          event_type: event.event_type,
        });
    }

    // Return 200 OK to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error("Unhandled error processing PayPal webhook", {
      error: error instanceof Error ? error.message : String(error),
    });

    captureException(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for PayPal webhooks
 */
export const POST = PayPalWebhookHandler;
