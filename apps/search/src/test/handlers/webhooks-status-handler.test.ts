import { describe, it, vi, expect, beforeEach, afterEach, Mock } from "vitest";
import { createMocks } from "node-mocks-http";
import { webhooksStatusHandler } from "../../pages/api/webhooks-status";
import * as SettingsManagerFactory from "../../lib/metadata";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import * as WebhookActivityTogglerServiceFactory from "../../domain/WebhookActivityToggler.service";
import {
  IWebhookActivityTogglerService,
  WebhookActivityTogglerService,
} from "../../domain/WebhookActivityToggler.service";
import { Client } from "urql";

describe("webhooksStatusHandler", () => {
  const settingsManagerMock: SettingsManager = {
    get: vi.fn(),
    set: vi.fn(),
  };

  const webhooksTogglerServiceMock: IWebhookActivityTogglerService = {
    disableOwnWebhooks: vi.fn(),
    enableOwnWebhooks: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();

    (settingsManagerMock.get as Mock).mockImplementationOnce(async () => undefined);

    vi.spyOn(SettingsManagerFactory, "createSettingsManager").mockImplementationOnce(() => {
      return settingsManagerMock;
    });

    vi.spyOn(
      WebhookActivityTogglerServiceFactory,
      "WebhookActivityTogglerService"
      // @ts-ignore
    ).mockImplementationOnce(() => {
      return webhooksTogglerServiceMock;
    });
  });

  it("Disables webhooks if Algolia settings are not saved in Saleor Metadata", async function () {
    const { req, res } = createMocks({});

    await webhooksStatusHandler(req, res, {
      authData: {
        appId: "app-id",
        domain: "domain.saleor.io",
        token: "token",
        saleorApiUrl: "https://domain.saleor.io/graphql",
      },
      baseUrl: "localhost:3000",
    });

    expect(webhooksTogglerServiceMock.disableOwnWebhooks).toHaveBeenCalled();
  });

  it("Disables webhooks if Algolia credentials are invalid", async function () {
    (settingsManagerMock.get as Mock).mockImplementation(async (key) => {
      console.log(key);
      // todo secret key not returned
      return key + "_value";
    });

    const { req, res } = createMocks({});

    await webhooksStatusHandler(req, res, {
      authData: {
        appId: "app-id",
        domain: "domain.saleor.io",
        token: "token",
        saleorApiUrl: "https://domain.saleor.io/graphql",
      },
      baseUrl: "localhost:3000",
    });

    expect(webhooksTogglerServiceMock.disableOwnWebhooks).toHaveBeenCalled();
  });

  it("Returns webhooks if Algolia credentials are valid", function () {});
});
