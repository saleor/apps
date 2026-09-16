import { type Client } from "urql";
import { afterEach, describe, expect, it, vi } from "vitest";

import { invoiceSentWebhook } from "../../pages/api/webhooks/invoice-sent";
import { orderCancelledWebhook } from "../../pages/api/webhooks/order-cancelled";
import { orderCreatedWebhook } from "../../pages/api/webhooks/order-created";
import { FeatureFlagService } from "../feature-flag-service/feature-flag-service";
import * as operationExports from "./api-operations";
import { WebhookManagementService } from "./webhook-management-service";
import { webhookStatusesFactory } from "./webhook-status-dict";

describe("WebhookManagementService", function () {
  const mockedClient = {} as Client;

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("API should be called, when getWebhooks is used", async () => {
    const webhookManagementService = new WebhookManagementService({
      client: mockedClient,
      appBaseUrl: "https://example.com",
      featureFlagService: new FeatureFlagService({
        client: {} as Client,
        saleorVersion: "3.14.0",
      }),
    });

    const fetchAppWebhooksMock = vi.spyOn(operationExports, "fetchAppWebhooks").mockResolvedValue([
      {
        asyncEvents: [{ eventType: "INVOICE_SENT", name: "Invoice sent" }],
        id: "1",
        isActive: true,
        name: invoiceSentWebhook.name,
      },
    ]);

    const webhookData = await webhookManagementService.getWebhooks();

    expect(webhookData).toStrictEqual([
      {
        asyncEvents: [{ eventType: "INVOICE_SENT", name: "Invoice sent" }],
        id: "1",
        isActive: true,
        name: invoiceSentWebhook.name,
      },
    ]);
    expect(fetchAppWebhooksMock).toBeCalledTimes(1);
  });

  it("Webhook statuses should be active, when webhook is created in the API and set to active", async () => {
    const webhookManagementService = new WebhookManagementService({
      client: mockedClient,
      appBaseUrl: "https://example.com",
      featureFlagService: new FeatureFlagService({
        client: {} as Client,
        saleorVersion: "3.14.0",
      }),
    });

    const fetchAppWebhooksMock = vi.spyOn(operationExports, "fetchAppWebhooks").mockResolvedValue([
      {
        asyncEvents: [{ eventType: "INVOICE_SENT", name: "Invoice sent" }],
        id: "1",
        isActive: true,
        name: invoiceSentWebhook.name,
      },
      {
        asyncEvents: [{ eventType: "ORDER_CANCELLED", name: "Order cancelled" }],
        id: "2",
        isActive: false,
        name: orderCancelledWebhook.name,
      },
    ]);

    const statuses = await webhookManagementService.getWebhooksStatus();

    expect(statuses).toStrictEqual(
      webhookStatusesFactory({ enabledWebhooks: ["invoiceSentWebhook"] }),
    );
    expect(fetchAppWebhooksMock).toBeCalledTimes(1);
  });

  it("Webhook should be created using the API, when requested", async () => {
    const webhookManagementService = new WebhookManagementService({
      client: mockedClient,
      appBaseUrl: "https://example.com",
      featureFlagService: new FeatureFlagService({
        client: {} as Client,
        saleorVersion: "3.14.0",
      }),
    });

    const createAppWebhookMock = vi.spyOn(operationExports, "createAppWebhook").mockResolvedValue({
      id: "1",
      isActive: true,
      name: invoiceSentWebhook.name,
      asyncEvents: [{ eventType: "INVOICE_SENT", name: "Invoice sent" }],
    });

    await webhookManagementService.createWebhook({
      webhook: "invoiceSentWebhook",
    });

    expect(createAppWebhookMock).toBeCalledTimes(1);

    // Values are taken from webhook definition
    expect(createAppWebhookMock).toBeCalledWith({
      client: mockedClient,
      variables: {
        asyncEvents: ["INVOICE_SENT"],
        isActive: true,
        name: invoiceSentWebhook.name,
        targetUrl: "https://example.com/api/webhooks/invoice-sent",
        query: expect.stringContaining("subscription InvoiceSent"),
      },
    });
  });

  it.each([
    { saleorVersion: "3.22.0", isSupported: false },
    { saleorVersion: "3.23.0", isSupported: true },
  ])(
    "Registered query should $#include GiftCardPaymentMethodDetails on Saleor $saleorVersion",
    async ({ saleorVersion, isSupported }) => {
      const webhookManagementService = new WebhookManagementService({
        client: mockedClient,
        appBaseUrl: "https://example.com",
        featureFlagService: new FeatureFlagService({
          client: {} as Client,
          saleorVersion,
        }),
      });

      const createAppWebhookMock = vi
        .spyOn(operationExports, "createAppWebhook")
        .mockResolvedValue({
          id: "1",
          isActive: true,
          name: orderCreatedWebhook.name,
          asyncEvents: [{ eventType: "ORDER_CREATED", name: "Order created" }],
        });

      await webhookManagementService.createWebhook({ webhook: "orderCreatedWebhook" });

      const { query } = createAppWebhookMock.mock.calls[0][0].variables;

      expect(query).toContain("CardPaymentMethodDetails");
      expect(query?.includes("GiftCardPaymentMethodDetails")).toBe(isSupported);
    },
  );

  it("Webhook should be deleted using the API, when requested", async () => {
    const webhookManagementService = new WebhookManagementService({
      client: mockedClient,
      appBaseUrl: "https://example.com",
      featureFlagService: new FeatureFlagService({
        client: {} as Client,
        saleorVersion: "3.14.0",
      }),
    });

    vi.spyOn(operationExports, "fetchAppWebhooks").mockResolvedValue([
      {
        asyncEvents: [{ eventType: "INVOICE_SENT", name: "Invoice sent" }],
        id: "1",
        isActive: true,
        name: invoiceSentWebhook.name,
      },
      {
        asyncEvents: [{ eventType: "ORDER_CANCELLED", name: "Order cancelled" }],
        id: "2",
        isActive: false,
        name: orderCancelledWebhook.name,
      },
    ]);

    const deleteAppWebhookMock = vi.spyOn(operationExports, "deleteAppWebhook").mockResolvedValue();

    await webhookManagementService.deleteWebhook({
      webhook: "invoiceSentWebhook",
    });

    expect(deleteAppWebhookMock).toBeCalledTimes(1);

    // Values are taken from webhook definition
    expect(deleteAppWebhookMock).toBeCalledWith({
      client: mockedClient,
      id: "1",
    });
  });
});
