import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { IWebhooksActivityClient } from "./webhook-activity-client";
import { WebhookActivityService } from "./webhook-activity-service";

describe("WebhookActivityService", () => {
  it("should enable app webhooks", async () => {
    const mockedClient: IWebhooksActivityClient = {
      enableSingleWebhook: vi.fn(() => Promise.resolve(ok(undefined))),
      fetchAppWebhooksIDs: vi.fn(() => Promise.resolve(ok(["webhook-id-1", "webhook-id-2"]))),
    };

    const service = new WebhookActivityService("app-id", mockedClient);

    await service.enableAppWebhooks();

    expect(mockedClient.fetchAppWebhooksIDs).toHaveBeenCalled();
    expect(mockedClient.enableSingleWebhook).toHaveBeenCalledTimes(2);
    expect(mockedClient.enableSingleWebhook).toHaveBeenNthCalledWith(1, "webhook-id-1");
    expect(mockedClient.enableSingleWebhook).toHaveBeenNthCalledWith(2, "webhook-id-2");
  });

  it("should throw error when fetching webhooks IDs fails", async () => {
    const mockedClient: IWebhooksActivityClient = {
      enableSingleWebhook: vi.fn(),
      fetchAppWebhooksIDs: vi.fn(() => Promise.resolve(err("Error during fetching webhooks IDs"))),
    };

    const service = new WebhookActivityService("app-id", mockedClient);

    // TODO: I used try-catch because I couldn't make the expect statement work
    try {
      await service.enableAppWebhooks();
    } catch (e) {
      expect(e).toBeInstanceOf(WebhookActivityService.WebhookActivityServiceWebhooksError);
    }

    expect(mockedClient.fetchAppWebhooksIDs).toHaveBeenCalled();
    expect(mockedClient.enableSingleWebhook).not.toHaveBeenCalled();
  });

  it("should throw error when enabling app webhooks fails", async () => {
    const mockedClient: IWebhooksActivityClient = {
      enableSingleWebhook: vi.fn(() => Promise.resolve(err("Error during enabling webhooks"))),
      fetchAppWebhooksIDs: vi.fn(() => Promise.resolve(ok(["webhook-id"]))),
    };

    const service = new WebhookActivityService("app-id", mockedClient);

    // TODO: I used try-catch because I couldn't make the expect statement work
    try {
      await service.enableAppWebhooks();
    } catch (e) {
      expect(e).toBeInstanceOf(WebhookActivityService.WebhookActivityServiceWebhooksError);
    }

    expect(mockedClient.fetchAppWebhooksIDs).toHaveBeenCalled();
    expect(mockedClient.enableSingleWebhook).toHaveBeenCalled();
  });
});
