import { Client } from "urql";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  IWebhooksActivityClient,
  WebhookActivityTogglerService,
} from "./WebhookActivityToggler.service";

describe("WebhookActivityTogglerService", function () {
  let mockWebhooksClient: IWebhooksActivityClient;
  let service: WebhookActivityTogglerService;

  beforeEach(() => {
    mockWebhooksClient = {
      enableSingleWebhook: vi.fn(),
      disableSingleWebhook: vi.fn(),
      fetchAppWebhooksIDs: vi.fn(),
      createWebhook: vi.fn(),
      removeSingleWebhook: vi.fn(),
    };

    service = new WebhookActivityTogglerService("ID", {} as Client, {
      WebhooksClient: mockWebhooksClient,
    });
  });

  describe("disableOwnWebhooks", () => {
    it("Calls disable single webhook procedures for each webhook in argument", async () => {
      await service.disableOwnWebhooks(["w1", "w2", "w3"]);

      expect(mockWebhooksClient.fetchAppWebhooksIDs).not.toHaveBeenCalled();
      expect(mockWebhooksClient.disableSingleWebhook).toHaveBeenCalledTimes(3);
      expect(mockWebhooksClient.disableSingleWebhook).toHaveBeenNthCalledWith(1, "w1");
      expect(mockWebhooksClient.disableSingleWebhook).toHaveBeenNthCalledWith(2, "w2");
      expect(mockWebhooksClient.disableSingleWebhook).toHaveBeenNthCalledWith(3, "w3");
    });

    it("Calls disable single webhook procedures for each webhook fetched from API client", async () => {
      vi.mocked(mockWebhooksClient.fetchAppWebhooksIDs).mockImplementationOnce(async () => [
        "w1",
        "w2",
        "w3",
      ]);

      await service.disableOwnWebhooks();

      expect(mockWebhooksClient.fetchAppWebhooksIDs).toHaveBeenCalled();
      expect(mockWebhooksClient.disableSingleWebhook).toHaveBeenCalledTimes(3);
      expect(mockWebhooksClient.disableSingleWebhook).toHaveBeenNthCalledWith(1, "w1");
      expect(mockWebhooksClient.disableSingleWebhook).toHaveBeenNthCalledWith(2, "w2");
      expect(mockWebhooksClient.disableSingleWebhook).toHaveBeenNthCalledWith(3, "w3");
    });
  });
  describe("enableOwnWebhooks", () => {
    it("Calls enable single webhooks procedures for each webhook fetched from API client", async () => {
      vi.mocked(mockWebhooksClient.fetchAppWebhooksIDs).mockImplementationOnce(async () => [
        "w1",
        "w2",
        "w3",
      ]);

      await service.enableOwnWebhooks();

      expect(mockWebhooksClient.fetchAppWebhooksIDs).toHaveBeenCalled();
      expect(mockWebhooksClient.enableSingleWebhook).toHaveBeenCalledTimes(3);
      expect(mockWebhooksClient.enableSingleWebhook).toHaveBeenNthCalledWith(1, "w1");
      expect(mockWebhooksClient.enableSingleWebhook).toHaveBeenNthCalledWith(2, "w2");
      expect(mockWebhooksClient.enableSingleWebhook).toHaveBeenNthCalledWith(3, "w3");
    });
  });
});
