import { testApiHandler } from "next-test-api-route-handler";
import { describe, expect, it, vi } from "vitest";

import * as manifestHandlers from "./route";

vi.mock("@/lib/env", async () => {
  const originalModule = await vi.importActual("@/lib/env");

  return {
    env: {
      // @ts-expect-error - it doesn't inherit the type
      ...originalModule.env,
      APP_IFRAME_BASE_URL: "https://localhost:3000",
      APP_API_BASE_URL: "https://localhost:3000",
    },
  };
});

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
                "query": "subscription PaymentGatewayInitializeSession { event { ...PaymentGatewayInitializeSessionEvent }}fragment EventMetadata on Event { version recipient { id }}fragment Channel on Channel { id slug}fragment SourceObject on OrderOrCheckout { ... on Checkout { __typename id channel { ...Channel } } ... on Order { __typename id channel { ...Channel } }}fragment PaymentGatewayInitializeSessionEvent on PaymentGatewayInitializeSession { ...EventMetadata sourceObject { ...SourceObject }}",
                "syncEvents": [
                  "PAYMENT_GATEWAY_INITIALIZE_SESSION",
                ],
                "targetUrl": "https://localhost:3000/api/webhooks/saleor/payment-gateway-initialize-session",
              },
              {
                "isActive": true,
                "name": "Stripe Transaction Initialize Session",
                "query": "subscription TransactionInitializeSession { event { ...TransactionInitializeSessionEvent }}fragment EventMetadata on Event { version recipient { id }}fragment Channel on Channel { id slug}fragment SourceObject on OrderOrCheckout { ... on Checkout { __typename id channel { ...Channel } } ... on Order { __typename id channel { ...Channel } }}fragment TransactionInitializeSessionEvent on TransactionInitializeSession { ...EventMetadata action { amount currency actionType } data transaction { id } sourceObject { ...SourceObject } idempotencyKey}",
                "syncEvents": [
                  "TRANSACTION_INITIALIZE_SESSION",
                ],
                "targetUrl": "https://localhost:3000/api/webhooks/saleor/transaction-initialize-session",
              },
              {
                "isActive": true,
                "name": "Stripe Transaction Process Session",
                "query": "subscription TransactionProcessSession { event { ...TransactionProcessSessionEvent }}fragment EventMetadata on Event { version recipient { id }}fragment Channel on Channel { id slug}fragment SourceObject on OrderOrCheckout { ... on Checkout { __typename id channel { ...Channel } } ... on Order { __typename id channel { ...Channel } }}fragment TransactionProcessSessionEvent on TransactionProcessSession { ...EventMetadata transaction { pspReference } action { amount actionType } sourceObject { ...SourceObject }}",
                "syncEvents": [
                  "TRANSACTION_PROCESS_SESSION",
                ],
                "targetUrl": "https://localhost:3000/api/webhooks/saleor/transaction-process-session",
              },
              {
                "isActive": true,
                "name": "Stripe Transaction Charge Requested",
                "query": "subscription TransactionChargeRequested { event { ...TransactionChargeRequestedEvent }}fragment EventMetadata on Event { version recipient { id }}fragment Channel on Channel { id slug}fragment TransactionChargeRequestedEvent on TransactionChargeRequested { ...EventMetadata action { amount } transaction { pspReference checkout { id channel { ...Channel } } order { id channel { ...Channel } } }}",
                "syncEvents": [
                  "TRANSACTION_CHARGE_REQUESTED",
                ],
                "targetUrl": "https://localhost:3000/api/webhooks/saleor/transaction-charge-requested",
              },
              {
                "isActive": true,
                "name": "Stripe Transaction Cancelation Requested",
                "query": "subscription TransactionCancelationRequested { event { ...TransactionCancelationRequestedEvent }}fragment EventMetadata on Event { version recipient { id }}fragment Channel on Channel { id slug}fragment TransactionCancelationRequestedEvent on TransactionCancelationRequested { ...EventMetadata transaction { pspReference checkout { id channel { ...Channel } } order { id channel { ...Channel } } }}",
                "syncEvents": [
                  "TRANSACTION_CANCELATION_REQUESTED",
                ],
                "targetUrl": "https://localhost:3000/api/webhooks/saleor/transaction-cancelation-requested",
              },
              {
                "isActive": true,
                "name": "Stripe Transaction Refund Requested",
                "query": "subscription TransactionRefundRequested { event { ...TransactionRefundRequestedEvent }}fragment EventMetadata on Event { version recipient { id }}fragment Channel on Channel { id slug}fragment TransactionRefundRequestedEvent on TransactionRefundRequested { ...EventMetadata action { amount currency } transaction { pspReference checkout { id channel { ...Channel } } order { id channel { ...Channel } } }}",
                "syncEvents": [
                  "TRANSACTION_REFUND_REQUESTED",
                ],
                "targetUrl": "https://localhost:3000/api/webhooks/saleor/transaction-refund-requested",
              },
            ],
          }
        `,
        );
      },
    });
  });
});
