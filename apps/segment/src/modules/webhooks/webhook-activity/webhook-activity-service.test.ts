import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { IWebhooksActivityClient } from "./webhook-activity-client";
import { WebhookActivityService } from "./webhook-activity-service";

describe("WebhookActivityService", () => {
  it("should enable app webhooks", async () => {
    const mockedClient: IWebhooksActivityClient = {
      enableSingleWebhook: vi.fn(() => Promise.resolve(ok(undefined))),
      fetchAppWebhooksInformation: vi.fn(() =>
        Promise.resolve(
          ok([
            { id: "webhook-id-1", isActive: true },
            { id: "webhook-id-2", isActive: true },
          ]),
        ),
      ),
    };

    const service = new WebhookActivityService("app-id", mockedClient);

    await service.enableAppWebhooks();

    expect(mockedClient.fetchAppWebhooksInformation).toHaveBeenCalled();
    expect(mockedClient.enableSingleWebhook).toHaveBeenCalledTimes(2);
    expect(mockedClient.enableSingleWebhook).toHaveBeenNthCalledWith(1, "webhook-id-1");
    expect(mockedClient.enableSingleWebhook).toHaveBeenNthCalledWith(2, "webhook-id-2");
  });

  it("should get information if webhooks are active", async () => {
    const mockedClient: IWebhooksActivityClient = {
      enableSingleWebhook: vi.fn(() => Promise.resolve(ok(undefined))),
      fetchAppWebhooksInformation: vi.fn(() =>
        Promise.resolve(
          ok([
            { id: "webhook-id-1", isActive: true },
            { id: "webhook-id-2", isActive: false },
          ]),
        ),
      ),
    };

    const service = new WebhookActivityService("app-id", mockedClient);

    const response = await service.getWebhooksIsActive();

    expect(response._unsafeUnwrap()).toStrictEqual([true, false]);
  });

  it("should throw error when fetching webhooks information fails", async () => {
    const mockedClient: IWebhooksActivityClient = {
      enableSingleWebhook: vi.fn(),
      fetchAppWebhooksInformation: vi.fn(() =>
        Promise.resolve(err("Error during fetching webhooks information")),
      ),
    };

    const service = new WebhookActivityService("app-id", mockedClient);

    const result = await service.enableAppWebhooks();

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(
      WebhookActivityService.WebhookActivityServiceWebhooksError,
    );

    expect(mockedClient.fetchAppWebhooksInformation).toHaveBeenCalled();
    expect(mockedClient.enableSingleWebhook).not.toHaveBeenCalled();
  });

  it("should throw error when enabling app webhooks fails", async () => {
    const mockedClient: IWebhooksActivityClient = {
      enableSingleWebhook: vi.fn(() => Promise.resolve(err("Error during enabling webhooks"))),
      fetchAppWebhooksInformation: vi.fn(() =>
        Promise.resolve(ok([{ id: "webhook-id", isActive: false }])),
      ),
    };

    const service = new WebhookActivityService("app-id", mockedClient);

    const result = await service.enableAppWebhooks();

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(
      WebhookActivityService.WebhookActivityServiceWebhooksError,
    );

    expect(mockedClient.fetchAppWebhooksInformation).toHaveBeenCalled();
    expect(mockedClient.enableSingleWebhook).toHaveBeenCalled();
  });
});
