import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";

const logger = createLogger("PayPalOrderUpdateCallback");

/**
 * PayPal Order Update Callback Handler
 *
 * This endpoint handles callbacks from PayPal when buyers update their information during checkout.
 * Supported events:
 * - SHIPPING_CHANGE: Buyer changed their shipping address
 * - SHIPPING_OPTIONS_CHANGE: Request for shipping options based on address
 * - BILLING_ADDRESS_CHANGE: Buyer changed their billing address
 * - PHONE_NUMBER_CHANGE: Buyer changed their phone number
 *
 * Response format:
 * - 200 OK: Changes accepted, optionally return updated shipping options
 * - 422 Unprocessable Entity: Changes rejected (e.g., don't ship to that address)
 *
 * @see https://developer.paypal.com/docs/checkout/advanced/customize/shipping-callback/
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    logger.info("Received PayPal order update callback", {
      eventType: body.event_type,
      orderId: body.resource?.id,
    });

    // Extract event type and resource
    const eventType = body.event_type;
    const resource = body.resource;

    if (!eventType || !resource) {
      logger.warn("Invalid callback payload - missing event_type or resource");
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (eventType) {
      case "CHECKOUT.ORDER.APPROVED": {
        // This is sent when callback_configuration is configured
        // and buyer changes shipping address or other info
        const shippingAddress = resource.purchase_units?.[0]?.shipping?.address;

        if (shippingAddress) {
          logger.debug("Shipping address from callback", { shippingAddress });

          // TODO: Implement shipping calculation logic
          // For now, accept all changes
          // In production, you would:
          // 1. Validate the shipping address
          // 2. Calculate shipping costs for the new address
          // 3. Return shipping options or reject if you don't ship there

          // Example response with shipping options:
          // return NextResponse.json({
          //   purchase_units: [{
          //     amount: {
          //       currency_code: "USD",
          //       value: "110.00",
          //       breakdown: {
          //         item_total: { currency_code: "USD", value: "100.00" },
          //         shipping: { currency_code: "USD", value: "10.00" },
          //       }
          //     },
          //     shipping: {
          //       options: [
          //         {
          //           id: "STANDARD",
          //           label: "Standard Shipping",
          //           amount: { currency_code: "USD", value: "5.00" },
          //           selected: true,
          //           type: "SHIPPING"
          //         },
          //         {
          //           id: "EXPRESS",
          //           label: "Express Shipping",
          //           amount: { currency_code: "USD", value: "10.00" },
          //           selected: false,
          //           type: "SHIPPING"
          //         }
          //       ]
          //     }
          //   }]
          // }, { status: 200 });
        }

        // Accept changes without modifications
        return NextResponse.json({}, { status: 200 });
      }

      case "CHECKOUT.ORDER.CALCULATE": {
        // Buyer selected a different shipping option
        const selectedShippingOption = resource.purchase_units?.[0]?.shipping?.options?.find(
          (opt: any) => opt.selected
        );

        logger.debug("Shipping option selected", { selectedShippingOption });

        // TODO: Recalculate order total based on selected shipping option
        // Return updated order with new totals

        return NextResponse.json({}, { status: 200 });
      }

      default:
        logger.warn("Unhandled event type", { eventType });
        return NextResponse.json({}, { status: 200 });
    }
  } catch (error) {
    logger.error("Error processing PayPal callback", { error });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
