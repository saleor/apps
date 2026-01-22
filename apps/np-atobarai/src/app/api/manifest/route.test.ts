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
            "about": "App that allows merchants using the Saleor e-commerce platform to accept online payments from customers using NP Atobarai as their payment processor.",
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
            "id": "saleor.app.payment.np-atobarai",
            "name": "NP Atobarai (NP後払い)",
            "permissions": [
              "HANDLE_PAYMENTS",
              "MANAGE_ORDERS",
            ],
            "requiredSaleorVersion": ">=3.21 <4",
            "supportUrl": "https://saleor.io/discord",
            "tokenTargetUrl": "https://localhost:3000/api/register",
            "version": Any<String>,
            "webhooks": [
              {
                "isActive": true,
                "name": "NP Atobarai Payment Gateway Initialize",
                "query": "subscription PaymentGatewayInitializeSession { event { ...PaymentGatewayInitializeSessionEvent }}fragment EventMetadata on Event { version issuedAt recipient { id }}fragment Channel on Channel { id slug currencyCode}fragment Address on Address { firstName lastName companyName postalCode countryArea streetAddress1 streetAddress2 phone city cityArea country { code }}fragment SourceObject on OrderOrCheckout { ... on Checkout { __typename id channel { ...Channel } email billingAddress { ...Address } shippingAddress { ...Address } discount { amount } shippingPrice { gross { amount } } totalPrice { gross { amount } } lines { __typename id quantity unitPrice { gross { amount } } checkoutVariant: variant { sku product { name } } } } ... on Order { __typename id channel { ...Channel } userEmail billingAddress { ...Address } shippingAddress { ...Address } discount { amount } shippingPrice { gross { amount } } total { gross { amount } } lines { __typename id quantity unitPrice { gross { amount } } orderVariant: variant { sku product { name } } } }}fragment PaymentGatewayInitializeSessionEvent on PaymentGatewayInitializeSession { ...EventMetadata sourceObject { ...SourceObject }}",
                "syncEvents": [
                  "PAYMENT_GATEWAY_INITIALIZE_SESSION",
                ],
                "targetUrl": "https://localhost:3000/api/webhooks/saleor/payment-gateway-initialize-session",
              },
              {
                "isActive": true,
                "name": "NP Atobarai Transaction Initialize Session",
                "query": "subscription TransactionInitializeSession { event { ...TransactionInitializeSessionEvent }}fragment EventMetadata on Event { version issuedAt recipient { id }}fragment Channel on Channel { id slug currencyCode}fragment Address on Address { firstName lastName companyName postalCode countryArea streetAddress1 streetAddress2 phone city cityArea country { code }}fragment SourceObject on OrderOrCheckout { ... on Checkout { __typename id channel { ...Channel } email billingAddress { ...Address } shippingAddress { ...Address } discount { amount } shippingPrice { gross { amount } } totalPrice { gross { amount } } lines { __typename id quantity unitPrice { gross { amount } } checkoutVariant: variant { sku product { name } } } } ... on Order { __typename id channel { ...Channel } userEmail billingAddress { ...Address } shippingAddress { ...Address } discount { amount } shippingPrice { gross { amount } } total { gross { amount } } lines { __typename id quantity unitPrice { gross { amount } } orderVariant: variant { sku product { name } } } }}fragment TransactionInitializeSessionEvent on TransactionInitializeSession { ...EventMetadata action { amount currency } transaction { token } sourceObject { ...SourceObject }}",
                "syncEvents": [
                  "TRANSACTION_INITIALIZE_SESSION",
                ],
                "targetUrl": "https://localhost:3000/api/webhooks/saleor/transaction-initialize-session",
              },
              {
                "isActive": true,
                "name": "NP Atobarai Transaction Process Session",
                "query": "subscription TransactionProcessSession { event { ...TransactionProcessSessionEvent }}fragment EventMetadata on Event { version issuedAt recipient { id }}fragment Channel on Channel { id slug currencyCode}fragment Address on Address { firstName lastName companyName postalCode countryArea streetAddress1 streetAddress2 phone city cityArea country { code }}fragment SourceObject on OrderOrCheckout { ... on Checkout { __typename id channel { ...Channel } email billingAddress { ...Address } shippingAddress { ...Address } discount { amount } shippingPrice { gross { amount } } totalPrice { gross { amount } } lines { __typename id quantity unitPrice { gross { amount } } checkoutVariant: variant { sku product { name } } } } ... on Order { __typename id channel { ...Channel } userEmail billingAddress { ...Address } shippingAddress { ...Address } discount { amount } shippingPrice { gross { amount } } total { gross { amount } } lines { __typename id quantity unitPrice { gross { amount } } orderVariant: variant { sku product { name } } } }}fragment TransactionProcessSessionEvent on TransactionProcessSession { ...EventMetadata action { amount currency } transaction { token pspReference } sourceObject { ...SourceObject }}",
                "syncEvents": [
                  "TRANSACTION_PROCESS_SESSION",
                ],
                "targetUrl": "https://localhost:3000/api/webhooks/saleor/transaction-process-session",
              },
              {
                "isActive": true,
                "name": "NP Atobarai Transaction Refund Requested",
                "query": "subscription TransactionRefundRequested { event { ...TransactionRefundRequestedEvent }}fragment EventMetadata on Event { version issuedAt recipient { id }}fragment OrderGrantedRefund on OrderGrantedRefund { shippingCostsIncluded lines { quantity orderLine { id } }}fragment Channel on Channel { id slug currencyCode}fragment Address on Address { firstName lastName companyName postalCode countryArea streetAddress1 streetAddress2 phone city cityArea country { code }}fragment SourceObject on OrderOrCheckout { ... on Checkout { __typename id channel { ...Channel } email billingAddress { ...Address } shippingAddress { ...Address } discount { amount } shippingPrice { gross { amount } } totalPrice { gross { amount } } lines { __typename id quantity unitPrice { gross { amount } } checkoutVariant: variant { sku product { name } } } } ... on Order { __typename id channel { ...Channel } userEmail billingAddress { ...Address } shippingAddress { ...Address } discount { amount } shippingPrice { gross { amount } } total { gross { amount } } lines { __typename id quantity unitPrice { gross { amount } } orderVariant: variant { sku product { name } } } }}fragment TransactionRefundRequestedEvent on TransactionRefundRequested { ...EventMetadata action { amount currency } grantedRefund { ...OrderGrantedRefund } transaction { token pspReference chargedAmount { amount } checkout { ...SourceObject } order { ...SourceObject } }}",
                "syncEvents": [
                  "TRANSACTION_REFUND_REQUESTED",
                ],
                "targetUrl": "https://localhost:3000/api/webhooks/saleor/transaction-refund-requested",
              },
              {
                "asyncEvents": [
                  "FULFILLMENT_TRACKING_NUMBER_UPDATED",
                ],
                "isActive": true,
                "name": "NP Atobarai Fulfillment Tracking Number Updated",
                "query": "subscription FulfillmentTrackingNumberUpdated { event { ...FulfillmentTrackingNumberUpdatedEvent }}fragment EventMetadata on Event { version issuedAt recipient { id }}fragment Channel on Channel { id slug currencyCode}fragment FulfillmentTrackingNumberUpdatedEvent on FulfillmentTrackingNumberUpdated { ...EventMetadata fulfillment { trackingNumber atobaraiPDCompanyCode: privateMetafield(key: "np-atobarai.pd-company-code") } order { id channel { ...Channel } transactions { pspReference createdBy { ... on App { __typename id } ... on User { __typename } } } }}",
                "targetUrl": "https://localhost:3000/api/webhooks/saleor/fulfillment-tracking-number-updated",
              },
            ],
          }
        `,
        );
      },
    });
  });
});
