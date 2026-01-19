import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
import { getPool } from "@/lib/database";
import {
  parseSaleorMetadata,
  PayPalCaptureResource,
  PayPalRefundResource,
  PayPalAuthorizationResource,
  PayPalMerchantResource,
  PayPalVettingResource,
  reportTransactionEventToSaleor,
  getSaleorApiUrlByMerchantId,
  getPayPalExternalUrl,
} from "@/modules/paypal/paypal-webhook-event-reporter";
import { TransactionEventTypeEnum } from "@/generated/graphql";
import { saleorApp } from "@/lib/saleor-app";

const logger = createLogger("PayPalPlatformWebhooks");

/**
 * PayPal Platform Webhook Handler
 *
 * Handles webhooks FROM PayPal TO this platform for events like:
 * - MERCHANT.PARTNER-CONSENT.REVOKED - Merchant revokes API permissions
 * - CUSTOMER.MERCHANT-INTEGRATION.PRODUCT-SUBSCRIPTION-UPDATED - Vetting status changes
 * - PAYMENT.CAPTURE.COMPLETED - Payment captured successfully
 * - PAYMENT.CAPTURE.DENIED - Payment capture failed
 * - PAYMENT.CAPTURE.REFUNDED - Refund processed
 * - PAYMENT.CAPTURE.REVERSED - Chargeback
 * - PAYMENT.AUTHORIZATION.CREATED - Authorization created
 * - PAYMENT.AUTHORIZATION.VOIDED - Authorization voided
 *
 * NOTE: This is different from Saleor webhooks. These are sent FROM PayPal TO our app.
 *
 * @see https://developer.paypal.com/api/rest/webhooks/
 * @see https://developer.paypal.com/docs/api-basics/notifications/webhooks/
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();

    // Extract webhook headers for signature verification
    const transmissionId = request.headers.get("paypal-transmission-id");
    const transmissionTime = request.headers.get("paypal-transmission-time");
    const transmissionSig = request.headers.get("paypal-transmission-sig");
    const certUrl = request.headers.get("paypal-cert-url");
    const webhookId = request.headers.get("paypal-auth-algo");

    logger.info("Received PayPal platform webhook", {
      eventType: body.event_type,
      eventId: body.id,
      createTime: body.create_time,
      transmissionId,
      hasSigHeaders: !!(transmissionId && transmissionTime && transmissionSig),
    });

    // TODO: Implement webhook signature verification
    // PayPal sends webhook signature in headers for verification
    // Headers: PAYPAL-TRANSMISSION-ID, PAYPAL-TRANSMISSION-TIME, PAYPAL-TRANSMISSION-SIG, PAYPAL-CERT-URL
    // See: https://developer.paypal.com/api/rest/webhooks/rest/#verify-webhook-signature
    // For now, we trust the webhook since it comes to our URL

    const eventType = body.event_type;
    const resource = body.resource;

    if (!eventType || !resource) {
      logger.warn("Invalid webhook payload - missing event_type or resource");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Route to appropriate handler based on event type
    switch (eventType) {
      case "MERCHANT.PARTNER-CONSENT.REVOKED": {
        await handleMerchantConsentRevoked(resource as PayPalMerchantResource);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      case "CUSTOMER.MERCHANT-INTEGRATION.PRODUCT-SUBSCRIPTION-UPDATED": {
        await handleMerchantVettingUpdated(resource as PayPalVettingResource);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      case "PAYMENT.CAPTURE.COMPLETED": {
        await handleCaptureCompleted(resource as PayPalCaptureResource);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      case "PAYMENT.CAPTURE.DENIED": {
        await handleCaptureDenied(resource as PayPalCaptureResource);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      case "PAYMENT.CAPTURE.REFUNDED": {
        await handleCaptureRefunded(resource as PayPalRefundResource);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      case "PAYMENT.CAPTURE.REVERSED": {
        await handleCaptureReversed(resource as PayPalCaptureResource);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      case "PAYMENT.AUTHORIZATION.CREATED": {
        await handleAuthorizationCreated(resource as PayPalAuthorizationResource);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      case "PAYMENT.AUTHORIZATION.VOIDED": {
        await handleAuthorizationVoided(resource as PayPalAuthorizationResource);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      default:
        logger.warn("Unhandled webhook event type", { eventType });
        // Return 200 to acknowledge receipt even for unhandled events
        return NextResponse.json({ received: true }, { status: 200 });
    }
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error("Error processing PayPal platform webhook", {
      error: error instanceof Error ? error.message : String(error),
      processingTime,
    });

    // Return 500 to signal PayPal to retry
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Handle MERCHANT.PARTNER-CONSENT.REVOKED event
 * Merchant revoked API permissions from the partner
 */
async function handleMerchantConsentRevoked(resource: PayPalMerchantResource): Promise<void> {
  const merchantId = resource.merchant_id;

  logger.warn("Merchant revoked API permissions", {
    merchantId,
    partnerMerchantId: resource.partner_merchant_id,
    trackingId: resource.tracking_id,
  });

  if (!merchantId) {
    logger.warn("No merchant_id in consent revoked event");
    return;
  }

  try {
    const pool = getPool();

    // Update merchant status in database
    const result = await pool.query(
      `UPDATE paypal_merchant_onboarding
       SET oauth_integrated = FALSE,
           onboarding_status = 'FAILED',
           status_check_error = 'Merchant revoked API permissions',
           updated_at = NOW()
       WHERE paypal_merchant_id = $1`,
      [merchantId]
    );

    if (result.rowCount && result.rowCount > 0) {
      logger.info("Marked merchant as disconnected due to consent revocation", {
        merchantId,
        rowsUpdated: result.rowCount,
      });
    } else {
      logger.warn("Merchant not found in database for consent revocation", { merchantId });
    }
  } catch (error) {
    logger.error("Failed to update merchant status after consent revocation", {
      merchantId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Handle CUSTOMER.MERCHANT-INTEGRATION.PRODUCT-SUBSCRIPTION-UPDATED event
 * Vetting status changed for a merchant's product subscription
 */
async function handleMerchantVettingUpdated(resource: PayPalVettingResource): Promise<void> {
  const merchantId = resource.merchant_id;
  const trackingId = resource.tracking_id;
  const productName = resource.product?.name;
  const vettingStatus = resource.product?.vetting_status;

  logger.info("Merchant vetting status updated", {
    merchantId,
    trackingId,
    productName,
    vettingStatus,
  });

  if (!merchantId && !trackingId) {
    logger.warn("No merchant_id or tracking_id in vetting update event");
    return;
  }

  try {
    const pool = getPool();

    // Determine which payment method capability to update based on product name
    let columnToUpdate: string | null = null;
    let enableValue = vettingStatus === "SUBSCRIBED";

    // Map PayPal product names to our database columns
    // Common product names: PPCP, EXPRESS_CHECKOUT, PPCP_CUSTOM, PPCP_STANDARD, etc.
    if (productName?.includes("PPCP") || productName === "EXPRESS_CHECKOUT") {
      columnToUpdate = "paypal_buttons_enabled";
    } else if (productName === "ADVANCED_VAULTING" || productName?.includes("VAULT")) {
      columnToUpdate = "vaulting_enabled";
    }

    // Build update query
    let query: string;
    let params: any[];

    if (merchantId) {
      query = `UPDATE paypal_merchant_onboarding
               SET ${columnToUpdate ? `${columnToUpdate} = $2,` : ""}
                   last_status_check = NOW(),
                   updated_at = NOW()
               WHERE paypal_merchant_id = $1`;
      params = columnToUpdate ? [merchantId, enableValue] : [merchantId];
    } else {
      query = `UPDATE paypal_merchant_onboarding
               SET ${columnToUpdate ? `${columnToUpdate} = $2,` : ""}
                   last_status_check = NOW(),
                   updated_at = NOW()
               WHERE tracking_id = $1`;
      params = columnToUpdate ? [trackingId, enableValue] : [trackingId];
    }

    const result = await pool.query(query, params);

    logger.info("Updated merchant vetting status", {
      merchantId,
      trackingId,
      productName,
      vettingStatus,
      columnUpdated: columnToUpdate,
      rowsUpdated: result.rowCount,
    });
  } catch (error) {
    logger.error("Failed to update merchant vetting status", {
      merchantId,
      trackingId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Handle PAYMENT.CAPTURE.COMPLETED event
 * Payment was successfully captured
 */
async function handleCaptureCompleted(resource: PayPalCaptureResource): Promise<void> {
  const captureId = resource.id;
  const amount = resource.amount;
  const customId = resource.custom_id;

  logger.info("Payment capture completed", {
    captureId,
    amount,
    status: resource.status,
    hasCustomId: !!customId,
  });

  // Parse Saleor metadata from custom_id
  const metadata = parseSaleorMetadata(customId);

  if (metadata) {
    logger.info("Found Saleor metadata in capture", {
      captureId,
      saleorTransactionId: metadata.saleor_transaction_id,
      saleorSourceId: metadata.saleor_source_id,
    });

    // Note: The CHARGE_SUCCESS event is already reported synchronously when we capture the order.
    // This webhook is a confirmation/backup. We could report it again but it might be marked as already processed.
    // For now, just log that we received the confirmation.
    logger.info("Capture confirmation received from PayPal webhook (event already reported during capture)", {
      captureId,
      saleorTransactionId: metadata.saleor_transaction_id,
    });
  } else {
    logger.warn("No Saleor metadata found in capture - cannot report to Saleor", {
      captureId,
      customId,
    });
  }
}

/**
 * Handle PAYMENT.CAPTURE.DENIED event
 * Payment capture was denied/failed
 */
async function handleCaptureDenied(resource: PayPalCaptureResource): Promise<void> {
  const captureId = resource.id;
  const amount = resource.amount;
  const customId = resource.custom_id;

  logger.warn("Payment capture denied", {
    captureId,
    amount,
    status: resource.status,
    hasCustomId: !!customId,
  });

  // Parse Saleor metadata from custom_id
  const metadata = parseSaleorMetadata(customId);

  if (metadata) {
    logger.warn("Capture denied for Saleor transaction", {
      captureId,
      saleorTransactionId: metadata.saleor_transaction_id,
      saleorSourceId: metadata.saleor_source_id,
    });

    // Note: Similar to capture completed, the failure would typically be reported synchronously.
    // This webhook serves as confirmation.
    logger.info("Capture denial confirmation received from PayPal webhook", {
      captureId,
      saleorTransactionId: metadata.saleor_transaction_id,
    });
  } else {
    logger.warn("No Saleor metadata found in denied capture", {
      captureId,
      customId,
    });
  }
}

/**
 * Handle PAYMENT.CAPTURE.REFUNDED event
 * A refund was processed for a capture
 *
 * This is the key event for async refund status updates.
 * When we initiate a refund via the refund-requested webhook, we get a synchronous response.
 * But PayPal may also process refunds externally (e.g., via PayPal dashboard) or there may be
 * delays. This webhook confirms the final refund status.
 */
async function handleCaptureRefunded(resource: PayPalRefundResource): Promise<void> {
  const refundId = resource.id;
  const amount = resource.amount;
  const customId = resource.custom_id;

  logger.info("Refund processed", {
    refundId,
    amount,
    status: resource.status,
    hasCustomId: !!customId,
  });

  // Parse Saleor metadata from custom_id (if the original order had it)
  const metadata = parseSaleorMetadata(customId);

  if (metadata) {
    logger.info("Found Saleor metadata in refund", {
      refundId,
      saleorTransactionId: metadata.saleor_transaction_id,
      saleorSourceId: metadata.saleor_source_id,
    });

    // Note: The refund is typically reported synchronously when we call refundCapture.
    // This webhook is a confirmation that the refund completed.
    // If the refund was initiated externally (via PayPal dashboard), we should report it.
    logger.info("Refund confirmation received from PayPal webhook", {
      refundId,
      saleorTransactionId: metadata.saleor_transaction_id,
      amountValue: amount?.value,
      amountCurrency: amount?.currency_code,
    });

    // Report refund success to Saleor
    if (amount?.value && amount?.currency_code) {
      try {
        // Get Saleor API URL from merchant ID lookup
        const saleorApiUrl = await getSaleorApiUrlByMerchantId(metadata.saleor_source_id);
        
        if (saleorApiUrl) {
          // Get auth data for this Saleor instance
          const authData = await saleorApp.apl.get(saleorApiUrl);
          
          if (authData) {
            const reportResult = await reportTransactionEventToSaleor({
              saleorApiUrl: authData.saleorApiUrl,
              saleorToken: authData.token,
              transactionId: metadata.saleor_transaction_id,
              type: "REFUND_SUCCESS",
              amount: amount.value,
              pspReference: refundId,
              message: "PayPal refund completed successfully",
              externalUrl: getPayPalExternalUrl(refundId, "SANDBOX"), // TODO: Use actual environment
            });

            if (reportResult.isErr()) {
              logger.error("Failed to report refund success to Saleor", {
                error: reportResult.error.message,
                refundId,
                saleorTransactionId: metadata.saleor_transaction_id,
              });
            } else {
              logger.info("Successfully reported refund success to Saleor", {
                refundId,
                saleorTransactionId: metadata.saleor_transaction_id,
                alreadyProcessed: reportResult.value.alreadyProcessed,
              });
            }
          } else {
            logger.error("No auth data found for Saleor API URL", {
              saleorApiUrl,
              refundId,
            });
          }
        } else {
          logger.error("Could not find Saleor API URL for merchant", {
            merchantId: metadata.saleor_source_id,
            refundId,
          });
        }
      } catch (error) {
        logger.error("Exception while reporting refund to Saleor", {
          error: error instanceof Error ? error.message : String(error),
          refundId,
          saleorTransactionId: metadata.saleor_transaction_id,
        });
      }
    }
  } else {
    // If no metadata, this might be a refund initiated externally via PayPal dashboard
    // In this case, we can't link it back to a Saleor transaction
    logger.warn("No Saleor metadata found in refund - may have been initiated externally", {
      refundId,
      customId,
    });
  }
}

/**
 * Handle PAYMENT.CAPTURE.REVERSED event
 * A capture was reversed (chargeback)
 */
async function handleCaptureReversed(resource: PayPalCaptureResource): Promise<void> {
  const captureId = resource.id;
  const amount = resource.amount;
  const customId = resource.custom_id;

  logger.warn("Payment capture reversed (CHARGEBACK)", {
    captureId,
    amount,
    status: resource.status,
    hasCustomId: !!customId,
  });

  // Parse Saleor metadata from custom_id
  const metadata = parseSaleorMetadata(customId);

  if (metadata) {
    logger.warn("Chargeback received for Saleor transaction", {
      captureId,
      saleorTransactionId: metadata.saleor_transaction_id,
      saleorSourceId: metadata.saleor_source_id,
      amountValue: amount?.value,
      amountCurrency: amount?.currency_code,
    });

    // Chargebacks are critical events that should be reported to Saleor
    // The transaction event type for chargebacks is CHARGE_BACK
    // However, we need Saleor API credentials to report this, which we don't have in this context
    // The proper solution would be to store app tokens per tenant and use them here
    logger.warn("Chargeback needs to be manually reviewed - cannot auto-report to Saleor without stored credentials", {
      captureId,
      saleorTransactionId: metadata.saleor_transaction_id,
    });
  } else {
    logger.warn("No Saleor metadata found in reversed capture", {
      captureId,
      customId,
    });
  }
}

/**
 * Handle PAYMENT.AUTHORIZATION.CREATED event
 * An authorization was created
 */
async function handleAuthorizationCreated(resource: PayPalAuthorizationResource): Promise<void> {
  const authorizationId = resource.id;
  const amount = resource.amount;
  const customId = resource.custom_id;

  logger.info("Payment authorization created", {
    authorizationId,
    amount,
    status: resource.status,
    hasCustomId: !!customId,
  });

  // Parse Saleor metadata from custom_id
  const metadata = parseSaleorMetadata(customId);

  if (metadata) {
    logger.info("Authorization created for Saleor transaction", {
      authorizationId,
      saleorTransactionId: metadata.saleor_transaction_id,
      saleorSourceId: metadata.saleor_source_id,
    });

    // Note: Authorization success is typically reported synchronously when we authorize the order.
    // This webhook is a confirmation.
    logger.info("Authorization confirmation received from PayPal webhook", {
      authorizationId,
      saleorTransactionId: metadata.saleor_transaction_id,
    });
  } else {
    logger.warn("No Saleor metadata found in authorization", {
      authorizationId,
      customId,
    });
  }
}

/**
 * Handle PAYMENT.AUTHORIZATION.VOIDED event
 * An authorization was voided/cancelled
 */
async function handleAuthorizationVoided(resource: PayPalAuthorizationResource): Promise<void> {
  const authorizationId = resource.id;
  const amount = resource.amount;
  const customId = resource.custom_id;

  logger.info("Payment authorization voided", {
    authorizationId,
    amount,
    status: resource.status,
    hasCustomId: !!customId,
  });

  // Parse Saleor metadata from custom_id
  const metadata = parseSaleorMetadata(customId);

  if (metadata) {
    logger.info("Authorization voided for Saleor transaction", {
      authorizationId,
      saleorTransactionId: metadata.saleor_transaction_id,
      saleorSourceId: metadata.saleor_source_id,
    });

    // Note: Void success is typically reported synchronously when we void the authorization.
    // This webhook is a confirmation.
    logger.info("Authorization void confirmation received from PayPal webhook", {
      authorizationId,
      saleorTransactionId: metadata.saleor_transaction_id,
    });
  } else {
    logger.warn("No Saleor metadata found in voided authorization", {
      authorizationId,
      customId,
    });
  }
}
