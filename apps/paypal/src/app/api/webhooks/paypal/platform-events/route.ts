import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";

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
 *
 * NOTE: This is different from Saleor webhooks. These are sent FROM PayPal TO our app.
 *
 * @see https://developer.paypal.com/api/rest/webhooks/
 * @see https://developer.paypal.com/docs/api-basics/notifications/webhooks/
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    logger.info("Received PayPal platform webhook", {
      eventType: body.event_type,
      eventId: body.id,
      createTime: body.create_time,
    });

    // TODO: Implement webhook signature verification
    // PayPal sends webhook signature in headers for verification
    // Headers: PAYPAL-TRANSMISSION-ID, PAYPAL-TRANSMISSION-TIME, PAYPAL-TRANSMISSION-SIG, PAYPAL-CERT-URL
    // See: https://developer.paypal.com/api/rest/webhooks/rest/#verify-webhook-signature

    const eventType = body.event_type;
    const resource = body.resource;

    if (!eventType || !resource) {
      logger.warn("Invalid webhook payload - missing event_type or resource");
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    // Route to appropriate handler based on event type
    switch (eventType) {
      case "MERCHANT.PARTNER-CONSENT.REVOKED": {
        // Merchant revoked API permissions
        logger.warn("Merchant revoked API permissions", {
          merchantId: resource.merchant_id,
          partnerMerchantId: resource.partner_merchant_id,
        });

        // TODO: Implement handler logic:
        // 1. Find merchant in database by merchant_id
        // 2. Mark merchant as disconnected
        // 3. Disable PayPal checkout for this merchant
        // 4. Optionally notify merchant via email

        return NextResponse.json({ received: true }, { status: 200 });
      }

      case "CUSTOMER.MERCHANT-INTEGRATION.PRODUCT-SUBSCRIPTION-UPDATED": {
        // Vetting status changed for a product
        logger.info("Merchant vetting status updated", {
          merchantId: resource.merchant_id,
          productName: resource.product?.name,
          vettingStatus: resource.product?.vetting_status,
        });

        // TODO: Implement handler logic:
        // 1. Find merchant in database
        // 2. Update vetting status for the product
        // 3. If status is SUBSCRIBED, enable payment method
        // 4. If status is DENIED or NEED_MORE_DATA, notify merchant

        return NextResponse.json({ received: true }, { status: 200 });
      }

      case "PAYMENT.CAPTURE.COMPLETED": {
        // Payment capture completed
        logger.info("Payment capture completed", {
          captureId: resource.id,
          amount: resource.amount,
          status: resource.status,
        });

        // TODO: Implement handler logic:
        // 1. Update transaction status in database
        // 2. Trigger order fulfillment if needed
        // 3. Send confirmation to buyer

        return NextResponse.json({ received: true }, { status: 200 });
      }

      case "PAYMENT.CAPTURE.DENIED": {
        // Payment capture denied
        logger.warn("Payment capture denied", {
          captureId: resource.id,
          amount: resource.amount,
          status: resource.status,
        });

        // TODO: Implement handler logic:
        // 1. Update transaction status to failed
        // 2. Notify merchant
        // 3. Cancel order if needed

        return NextResponse.json({ received: true }, { status: 200 });
      }

      case "PAYMENT.CAPTURE.REFUNDED": {
        // Refund processed
        logger.info("Refund processed", {
          refundId: resource.id,
          amount: resource.amount,
          status: resource.status,
        });

        // TODO: Implement handler logic:
        // 1. Update refund status in database
        // 2. Update order status
        // 3. Notify merchant and buyer

        return NextResponse.json({ received: true }, { status: 200 });
      }

      default:
        logger.warn("Unhandled webhook event type", { eventType });
        // Return 200 to acknowledge receipt even for unhandled events
        return NextResponse.json({ received: true }, { status: 200 });
    }
  } catch (error) {
    logger.error("Error processing PayPal platform webhook", { error });

    // Return 500 to signal PayPal to retry
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
