import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { createMocks } from "node-mocks-http";
import { webhooksStatusHandlerFactory } from "../../pages/api/webhooks-status";
import { Client, OperationResult } from "urql";
import { IWebhookActivityTogglerService } from "../../domain/WebhookActivityToggler.service";
import { SearchProvider } from "../../lib/searchProvider";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { NextProtectedApiHandler } from "@saleor/app-sdk/handlers/next";
import {
  FetchOwnWebhooksQuery,
  WebhookEventTypeAsyncEnum,
  WebhookEventTypeEnum,
} from "../../../generated/graphql";

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
      webhooks: [
        {
          id: "w1",
          isActive: true,
          asyncEvents: [
            { eventType: WebhookEventTypeAsyncEnum.ProductCreated, name: "ProductCreated" },
          ],
          eventDeliveries: {
            edges: [],
          },
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
    disableOwnWebhooks: vi.fn(),
    enableOwnWebhooks: vi.fn(),
  };

  const algoliaSearchProviderMock: Pick<SearchProvider, "ping"> = {
    ping: vi.fn(),
  };

  const settingsManagerMock: SettingsManager = {
    get: vi.fn(),
    set: vi.fn(),
  };

  let handler: NextProtectedApiHandler;

  beforeEach(() => {
    vi.resetAllMocks();

    handler = webhooksStatusHandlerFactory({
      graphqlClientFactory: () => client,
      webhookActivityTogglerFactory: () => webhooksTogglerServiceMock,
      algoliaSearchProviderFactory: () => algoliaSearchProviderMock,
      settingsManagerFactory: () => settingsManagerMock,
    });

    (client.query as Mock).mockImplementationOnce(() => {
      return {
        async toPromise() {
          return appWebhooksResponseData;
        },
      };
    });
  });

  it("Disables webhooks if Algolia settings are not saved in Saleor Metadata", async function () {
    const { req, res } = createMocks({});

    await handler(req, res, mockWebhookContext);

    expect(webhooksTogglerServiceMock.disableOwnWebhooks).toHaveBeenCalled();
    expect(algoliaSearchProviderMock.ping).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
  });

  it("Disables webhooks if Algolia credentials are invalid", async function () {
    (settingsManagerMock.get as Mock).mockReturnValue("metadata-value");
    (algoliaSearchProviderMock.ping as Mock).mockImplementationOnce(async () => {
      throw new Error();
    });

    const { req, res } = createMocks({});

    await handler(req, res, mockWebhookContext);

    expect(webhooksTogglerServiceMock.disableOwnWebhooks).toHaveBeenCalled();
    expect(algoliaSearchProviderMock.ping).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
  });

  it("Returns webhooks if Algolia credentials are valid", async function () {
    (settingsManagerMock.get as Mock).mockReturnValue("metadata-value");
    (algoliaSearchProviderMock.ping as Mock).mockImplementationOnce(async () => Promise.resolve());

    const { req, res } = createMocks({});

    await handler(req, res, mockWebhookContext);

    expect(webhooksTogglerServiceMock.disableOwnWebhooks).not.toHaveBeenCalled();
    expect(algoliaSearchProviderMock.ping).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
  });
});
