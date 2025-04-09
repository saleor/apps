import { testApiHandler } from "next-test-api-route-handler";
import { describe, expect, it, vi } from "vitest";

import * as manifestHandlers from "./route";

vi.mock("@/lib/env", () => ({
  env: {
    APP_IFRAME_BASE_URL: "https://localhost:3000",
    APP_API_BASE_URL: "https://localhost:3000",
  },
}));

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

        expect(body).toMatchInlineSnapshot(
          {
            version: expect.any(String),
          },
          `
          {
            "about": "App that allows merchants using the Saleor e-commerce platform to accept online payments from customers using Stripe as their payment processor.",
            "appUrl": "https://localhost:3000",
            "author": "Saleor Commerce",
            "brand": {
              "logo": {
                "default": "https://localhost:3000/logo.png",
              },
            },
            "dataPrivacyUrl": "https://saleor.io/legal/privacy/",
            "extensions": [],
            "homepageUrl": "https://github.com/saleor/apps",
            "name": "Stripe",
            "permissions": [
              "HANDLE_PAYMENTS",
            ],
            "requiredSaleorVersion": ">=3.20 <4",
            "supportUrl": "https://saleor.io/discord",
            "tokenTargetUrl": "https://localhost:3000/api/register",
            "version": Any<String>,
            "webhooks": [
              {
                "isActive": true,
                "name": "Stripe Payment Gateway Initialize",
                "query": "subscription PaymentGatewayInitializeSession { event { ... on PaymentGatewayInitializeSession { ...PaymentGatewayInitializeSessionEvent } }}fragment Channel on Channel { id slug}fragment PaymentGatewayInitializeSessionEvent on PaymentGatewayInitializeSession { version sourceObject { ... on Checkout { channel { ...Channel } } ... on Order { channel { ...Channel } } }}",
                "syncEvents": [
                  "PAYMENT_GATEWAY_INITIALIZE_SESSION",
                ],
                "targetUrl": "https://localhost:3000/api/saleor/payment-gateway-initialize-session",
              },
              {
                "isActive": true,
                "name": "Stripe Transaction Initialize Session",
                "query": "subscription TransactionInitializeSession { event { ... on TransactionInitializeSession { ...TransactionInitializeSessionEvent } }}fragment Channel on Channel { id slug}fragment TransactionInitializeSessionEvent on TransactionInitializeSession { version action { amount currency } sourceObject { ... on Checkout { channel { ...Channel } } ... on Order { channel { ...Channel } } }}",
                "syncEvents": [
                  "TRANSACTION_INITIALIZE_SESSION",
                ],
                "targetUrl": "https://localhost:3000/api/saleor/transaction-initialize-session",
              },
            ],
          }
        `,
        );
      },
    });
  });
});
