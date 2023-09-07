import { NextProtectedApiHandler, ProtectedHandlerContext } from "@saleor/app-sdk/handlers/next";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { createMocks } from "node-mocks-http";
import { Client, OperationResult } from "urql";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { FetchOwnWebhooksQuery, WebhookEventTypeAsyncEnum } from "../../../generated/graphql";
import { IWebhookActivityTogglerService } from "../../domain/WebhookActivityToggler.service";
import { SearchProvider } from "../../lib/searchProvider";
import { webhooksStatusHandlerFactory } from "../../pages/api/webhooks-status";
import { AppConfig } from "../../modules/configuration/configuration";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Context provided from ProtectedApiHandler to handler body
 */
const mockWebhookContext: ProtectedHandlerContext = {
  authData: {
    appId: "app-id",
    domain: "domain.saleor.io",
    token: "token",
    saleorApiUrl: "https://domain.saleor.io/graphql",
  },
  baseUrl: "localhost:3000",
  user: {
    email: "",
    userPermissions: [],
  },
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
    disableOwnWebhooks: vi.fn(),
    enableOwnWebhooks: vi.fn(),
    recreateOwnWebhooks: vi.fn(),
  };

  const algoliaSearchProviderMock: Pick<SearchProvider, "ping"> = {
    ping: vi.fn(),
  };

  const settingsManagerMock: SettingsManager = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
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

    // @ts-expect-error - mock doesnt contain next-specific fields
    await handler(req, res, mockWebhookContext);

    expect(webhooksTogglerServiceMock.disableOwnWebhooks).toHaveBeenCalled();
    expect(algoliaSearchProviderMock.ping).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
  });

  it("Disables webhooks if Algolia credentials are set, but invalid", async function () {
    const invalidConfig = new AppConfig();

    invalidConfig.setAlgoliaSettings({
      appId: "asd",
      secretKey: "wrong",
      indexNamePrefix: "test",
    });

    (settingsManagerMock.get as Mock).mockReturnValueOnce(invalidConfig.serialize());
    (algoliaSearchProviderMock.ping as Mock).mockImplementationOnce(async () => {
      throw new Error();
    });

    const { req, res } = createMocks({});

    // @ts-expect-error - mock doesnt contain next-specific fields
    await handler(req, res, mockWebhookContext);

    expect(webhooksTogglerServiceMock.disableOwnWebhooks).toHaveBeenCalled();
    expect(algoliaSearchProviderMock.ping).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
  });

  it("Returns webhooks if Algolia credentials are valid", async function () {
    const validConfig = new AppConfig();

    validConfig.setAlgoliaSettings({
      appId: "asd",
      secretKey: "asddsada",
      indexNamePrefix: "test",
    });

    (settingsManagerMock.get as Mock).mockReturnValueOnce(validConfig.serialize());
    (algoliaSearchProviderMock.ping as Mock).mockImplementationOnce(async () => Promise.resolve());

    const { req, res } = createMocks({});

    await handler(req, res, mockWebhookContext);

    expect(webhooksTogglerServiceMock.disableOwnWebhooks).not.toHaveBeenCalled();
    expect(algoliaSearchProviderMock.ping).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
  });
});
