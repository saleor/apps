import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { Client } from "urql";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FeatureFlagService } from "../feature-flag-service/feature-flag-service";
import { SmtpConfigurationService } from "../smtp/configuration/smtp-configuration.service";
import { SmtpMetadataManager } from "../smtp/configuration/smtp-metadata-manager";
import * as statusesExports from "./get-webhook-statuses-from-configurations";
import { syncWebhookStatus } from "./sync-webhook-status";
import { WebhookManagementService } from "./webhook-management-service";

const mockSaleorApiUrl = "https://demo.saleor.io/graphql/";

describe("syncWebhookStatus", function () {
  const createMockedClient = () => ({}) as Client;
  const createMockedFeatureFlagService = () => ({}) as FeatureFlagService;

  const webhookManagementService = new WebhookManagementService({
    appBaseUrl: mockSaleorApiUrl,
    client: createMockedClient(),
    featureFlagService: createMockedFeatureFlagService(),
  });

  const createWebhookMock = vi
    .spyOn(webhookManagementService, "createWebhook")
    .mockImplementation((_) => Promise.resolve());

  const deleteWebhookMock = vi
    .spyOn(webhookManagementService, "deleteWebhook")
    .mockImplementation((_) => Promise.resolve());

  const smtpConfigurator = new SmtpMetadataManager(
    null as unknown as SettingsManager,
    mockSaleorApiUrl,
  );

  const smtpConfigurationService = new SmtpConfigurationService({
    metadataManager: smtpConfigurator,
    initialData: {
      configurations: [],
    },
    featureFlagService: createMockedFeatureFlagService(),
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("No webhook should be created or deleted, when both API and configurations don't use any", async () => {
    vi.spyOn(statusesExports, "getWebhookStatusesFromConfigurations").mockReturnValue({
      invoiceSentWebhook: false,
      notifyWebhook: false,
      orderCancelledWebhook: false,
      orderConfirmedWebhook: false,
      orderFulfilledWebhook: false,
      orderCreatedWebhook: false,
      orderFullyPaidWebhook: false,
      giftCardSentWebhook: false,
      orderRefundedWebhook: false,
    });

    const getWebhooksStatusMock = vi
      .spyOn(webhookManagementService, "getWebhooksStatus")
      .mockResolvedValue({
        invoiceSentWebhook: false,
        notifyWebhook: false,
        orderCancelledWebhook: false,
        orderConfirmedWebhook: false,
        orderFulfilledWebhook: false,
        orderCreatedWebhook: false,
        orderFullyPaidWebhook: false,
        giftCardSentWebhook: false,
        orderRefundedWebhook: false,
      });

    await syncWebhookStatus({
      smtpConfigurationService,
      webhookManagementService,
    });

    expect(getWebhooksStatusMock).toHaveBeenCalled();
    expect(deleteWebhookMock).not.toHaveBeenCalled();
    expect(createWebhookMock).not.toHaveBeenCalled();
  });

  it("Webhooks should be deleted from API, when configurations no longer use them", async () => {
    vi.spyOn(statusesExports, "getWebhookStatusesFromConfigurations").mockReturnValue({
      invoiceSentWebhook: false,
      notifyWebhook: false,
      orderCancelledWebhook: false,
      orderConfirmedWebhook: false,
      orderFulfilledWebhook: false,
      orderCreatedWebhook: false,
      orderFullyPaidWebhook: false,
      giftCardSentWebhook: false,
      orderRefundedWebhook: false,
    });

    const getWebhooksStatusMock = vi
      .spyOn(webhookManagementService, "getWebhooksStatus")
      .mockResolvedValue({
        invoiceSentWebhook: true,
        notifyWebhook: true,
        orderCancelledWebhook: false,
        orderConfirmedWebhook: false,
        orderFulfilledWebhook: false,
        orderCreatedWebhook: false,
        orderFullyPaidWebhook: false,
        giftCardSentWebhook: false,
        orderRefundedWebhook: false,
      });

    await syncWebhookStatus({
      smtpConfigurationService,
      webhookManagementService,
    });

    expect(getWebhooksStatusMock).toHaveBeenCalled();
    expect(createWebhookMock).not.toHaveBeenCalled();
    expect(deleteWebhookMock).toHaveBeenCalledTimes(2);
  });

  it("Webhooks should be created using API, when new configurations use them", async () => {
    vi.spyOn(statusesExports, "getWebhookStatusesFromConfigurations").mockReturnValue({
      invoiceSentWebhook: true,
      notifyWebhook: true,
      orderCancelledWebhook: false,
      orderConfirmedWebhook: false,
      orderFulfilledWebhook: false,
      orderCreatedWebhook: false,
      orderFullyPaidWebhook: false,
      giftCardSentWebhook: false,
      orderRefundedWebhook: false,
    });

    const getWebhooksStatusMock = vi
      .spyOn(webhookManagementService, "getWebhooksStatus")
      .mockResolvedValue({
        invoiceSentWebhook: false,
        notifyWebhook: false,
        orderCancelledWebhook: false,
        orderConfirmedWebhook: false,
        orderFulfilledWebhook: false,
        orderCreatedWebhook: false,
        orderFullyPaidWebhook: false,
        giftCardSentWebhook: false,
        orderRefundedWebhook: false,
      });

    await syncWebhookStatus({
      smtpConfigurationService,
      webhookManagementService,
    });

    expect(getWebhooksStatusMock).toHaveBeenCalled();
    expect(createWebhookMock).toHaveBeenCalledTimes(2);
    expect(deleteWebhookMock).not.toHaveBeenCalled();
  });
});
