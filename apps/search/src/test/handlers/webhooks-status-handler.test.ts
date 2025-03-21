import { NextJsProtectedApiHandler } from "@saleor/app-sdk/handlers/next";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { createMocks } from "node-mocks-http";
import { Client, OperationResult } from "urql";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FetchOwnWebhooksQuery, WebhookEventTypeAsyncEnum } from "../../../generated/graphql";
import { IWebhookActivityTogglerService } from "../../domain/WebhookActivityToggler.service";
import { AppConfig } from "../../modules/configuration/configuration";
import { webhooksStatusHandlerFactory } from "../../pages/api/webhooks-status";

/**
 * Context provided from ProtectedApiHandler to handler body
 */
const mockWebhookContext = {
  authData: {
    appId: "app-id",
    domain: "domain.saleor.io",
    token: "token",
    saleorApiUrl: "https://domain.saleor.io/graphql",
  },
  baseUrl: "localhost:3000",
};

const appWebhooksResponseData: Pick<OperationResult<FetchOwnWebhooksQuery, any>, "data"> = {
  data: {
    app: {
      id: "appID",
      webhooks: [
        {
          name: "W1",
          id: "w1",
          isActive: true,
          asyncEvents: [
            { eventType: WebhookEventTypeAsyncEnum.ProductCreated, name: "ProductCreated" },
          ],
          eventDeliveries: {
            edges: [],
          },
          targetUrl: "localhost:3000/api/webhooks/test",
        },
      ],
    },
  },
};

describe("webhooksStatusHandler", () => {
  const client: Pick<Client, "query" | "mutation"> = {
    query: vi.fn(),
    mutation: vi.fn(),
  };

  const webhooksTogglerServiceMock: IWebhookActivityTogglerService = {
    enableOwnWebhooks: vi.fn(),
  };

  const settingsManagerMock: SettingsManager = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  };

  let handler: NextJsProtectedApiHandler;

  beforeEach(() => {
    vi.resetAllMocks();

    handler = webhooksStatusHandlerFactory({
      graphqlClientFactory: () => client,
    });

    // @ts-expect-error mocking the request for testing
    vi.mocked(client.query).mockImplementationOnce(() => {
      return {
        async toPromise() {
          return appWebhooksResponseData;
        },
      };
    });
  });

  it("Returns webhooks if Algolia credentials are valid", async function () {
    const validConfig = new AppConfig();

    validConfig.setAlgoliaSettings({
      appId: "asd",
      secretKey: "asddsada",
      indexNamePrefix: "test",
    });

    vi.mocked(settingsManagerMock.get).mockImplementation(() => {
      return Promise.resolve(validConfig.serialize());
    });

    const { req, res } = createMocks({});

    // @ts-expect-error mocking the request for testing
    await handler(req, res, mockWebhookContext);

    expect(res._getStatusCode()).toBe(200);
  });
});
