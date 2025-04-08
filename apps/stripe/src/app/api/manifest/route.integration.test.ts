import { testApiHandler } from "next-test-api-route-handler";
import { describe, expect, it } from "vitest";

import * as manifestHandlers from "./route";

describe("Manifest handler", async () => {
  /**
   * Verify snapshot - if your changes cause manifest to be different, ensure changes are expected
   */
  it("Renders manifest matching snapshot", async () => {
    await testApiHandler({
      appHandler: manifestHandlers,
      async test({ fetch }) {
        const body = await fetch({
          method: "GET",
        }).then((r) => r.json());

        expect(body).toMatchInlineSnapshot(`
          {
            "about": "App that allows merchants using the Saleor e-commerce platform to accept online payments from customers using Stripe as their payment processor.",
            "appUrl": "ntarh://[::1]:58267",
            "author": "Saleor Commerce",
            "brand": {
              "logo": {
                "default": "ntarh://[::1]:58267/logo.png",
              },
            },
            "dataPrivacyUrl": "https://saleor.io/legal/privacy/",
            "extensions": [],
            "homepageUrl": "https://github.com/saleor/apps",
            "id": "saleor.app.payment.stripe-v2",
            "name": "Stripe",
            "permissions": [
              "HANDLE_PAYMENTS",
            ],
            "requiredSaleorVersion": ">=3.20 <4",
            "supportUrl": "https://saleor.io/discord",
            "tokenTargetUrl": "ntarh://[::1]:58267/api/register",
            "version": "0.0.2",
            "webhooks": [
              {
                "isActive": false,
                "name": "Stripe Payment Gateway Initialize",
                "query": "subscription PaymentGatewayInitializeSession { event { ... on PaymentGatewayInitializeSession { ...PaymentGatewayInitializeSessionEvent } }}fragment Channel on Channel { id slug}fragment PaymentGatewayInitializeSessionEvent on PaymentGatewayInitializeSession { version sourceObject { ... on Checkout { channel { ...Channel } } ... on Order { channel { ...Channel } } }}",
                "syncEvents": [
                  "PAYMENT_GATEWAY_INITIALIZE_SESSION",
                ],
                "targetUrl": "ntarh://[::1]:58267/api/saleor/gateway-initialize",
              },
            ],
          }
        `);
      },
    });
  });
});
