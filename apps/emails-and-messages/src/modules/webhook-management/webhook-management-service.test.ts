import { vi, expect, describe, it, afterEach } from "vitest";
import { WebhookManagementService } from "./webhook-management-service";
import { Client } from "urql";
import * as operationExports from "./api-operations";
import { WebhookEventTypeAsyncEnum } from "../../../generated/graphql";
import { invoiceSentWebhook } from "../../pages/api/webhooks/invoice-sent";
import { orderCancelledWebhook } from "../../pages/api/webhooks/order-cancelled";

const mockSaleorApiUrl = "https://demo.saleor.io/graphql/";

describe("WebhookManagementService", function () {
  const mockedClient = {} as Client;

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("API should be called, when getWebhooks is used", async () => {
    const webhookManagementService = new WebhookManagementService(
      "https://example.com",
      mockedClient
    );

    const fetchAppWebhooksMock = vi.spyOn(operationExports, "fetchAppWebhooks").mockResolvedValue([
      {
        asyncEvents: [{ eventType: WebhookEventTypeAsyncEnum.InvoiceSent, name: "Invoice sent" }],
        id: "1",
        isActive: true,
        name: invoiceSentWebhook.name,
      },
    ]);

    const webhookData = await webhookManagementService.getWebhooks();

    expect(webhookData).toStrictEqual([
      {
        asyncEvents: [{ eventType: WebhookEventTypeAsyncEnum.InvoiceSent, name: "Invoice sent" }],
        id: "1",
        isActive: true,
        name: invoiceSentWebhook.name,
      },
    ]);
    expect(fetchAppWebhooksMock).toBeCalledTimes(1);
  });

  it("Webhook statuses should be active, when whists in API and active", async () => {
    const webhookManagementService = new WebhookManagementService(
      "https://example.com",
      mockedClient
    );

    const fetchAppWebhooksMock = vi.spyOn(operationExports, "fetchAppWebhooks").mockResolvedValue([
      {
        asyncEvents: [{ eventType: WebhookEventTypeAsyncEnum.InvoiceSent, name: "Invoice sent" }],
        id: "1",
        isActive: true,
        name: invoiceSentWebhook.name,
      },
      {
        asyncEvents: [
          { eventType: WebhookEventTypeAsyncEnum.OrderCancelled, name: "Order cancelled" },
        ],
        id: "2",
        isActive: false,
        name: orderCancelledWebhook.name,
      },
    ]);

    const statuses = await webhookManagementService.getWebhooksStatus();

    expect(statuses).toStrictEqual({
      invoiceSentWebhook: true,
      notifyWebhook: false,
      orderCancelledWebhook: false,
      orderConfirmedWebhook: false,
      orderCreatedWebhook: false,
      orderFulfilledWebhook: false,
      orderFullyPaidWebhook: false,
    });
    expect(fetchAppWebhooksMock).toBeCalledTimes(1);
  });

  it("Webhook should be created using the API, when requested", async () => {
    const webhookManagementService = new WebhookManagementService(
      "https://example.com",
      mockedClient
    );

    const createAppWebhookMock = vi.spyOn(operationExports, "createAppWebhook").mockResolvedValue({
      id: "1",
      isActive: true,
      name: invoiceSentWebhook.name,
      asyncEvents: [{ eventType: WebhookEventTypeAsyncEnum.InvoiceSent, name: "Invoice sent" }],
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
        query:
          "subscription InvoiceSent { event { ...InvoiceSentWebhookPayload }}fragment InvoiceSentWebhookPayload on InvoiceSent { invoice { id message externalUrl url order { id } } order { ...OrderDetails }}fragment OrderDetails on Order { id number userEmail channel { slug } user { email firstName lastName } billingAddress { streetAddress1 city postalCode country { country } } shippingAddress { streetAddress1 city postalCode country { country } } lines { id productName variantName quantity thumbnail { url alt } unitPrice { gross { currency amount } } totalPrice { gross { currency amount } } } subtotal { gross { amount currency } } shippingPrice { gross { amount currency } } total { gross { amount currency } }}",
      },
    });
  });

  it("Webhook should be deleted using the API, when requested", async () => {
    const webhookManagementService = new WebhookManagementService(
      "https://example.com",
      mockedClient
    );

    vi.spyOn(operationExports, "fetchAppWebhooks").mockResolvedValue([
      {
        asyncEvents: [{ eventType: WebhookEventTypeAsyncEnum.InvoiceSent, name: "Invoice sent" }],
        id: "1",
        isActive: true,
        name: invoiceSentWebhook.name,
      },
      {
        asyncEvents: [
          { eventType: WebhookEventTypeAsyncEnum.OrderCancelled, name: "Order cancelled" },
        ],
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
