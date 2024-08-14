import { describe, expect, it } from "vitest";

import { AppConfig } from "../../lib/app-config";
import { ChannelsConfig } from "../channel-configuration/channel-config";
import { ProviderConnections } from "../provider-connections/provider-connections";
import { AvataxWebhookServiceFactory } from "./avatax-webhook-service-factory";

const mockedProviders: ProviderConnections = [
  {
    provider: "avatax",
    id: "1",
    config: {
      isDocumentRecordingEnabled: true,
      companyCode: "DEFAULT",
      isAutocommit: false,
      isSandbox: true,
      name: "avatax-1",
      shippingTaxCode: "FR000000",
      credentials: {
        password: "avatax-password",
        username: "avatax-username",
      },
      address: {
        city: "New York",
        country: "US",
        state: "NY",
        street: "123 Main St",
        zip: "10001",
      },
    },
  },
];

const mockedChannelsWithInvalidProviderConnectionId: ChannelsConfig = [
  {
    id: "1",
    config: {
      providerConnectionId: "3",
      slug: "default-channel",
    },
  },
];

const mockedValidChannels: ChannelsConfig = [
  {
    id: "1",
    config: {
      providerConnectionId: "1",
      slug: "default-channel",
    },
  },
];

describe("AvataxWebhookServiceFactory", () => {
  it("throws BrokenConfigurationError error when no providerConnectionId was found", () => {
    const result = AvataxWebhookServiceFactory.createFromConfig(
      AppConfig.createFromParsedConfig({
        channels: mockedChannelsWithInvalidProviderConnectionId,
        providerConnections: mockedProviders,
      }),
      "default-channel",
    );

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(
      AvataxWebhookServiceFactory.BrokenConfigurationError,
    );
  });

  it("returns provider when data is correct", () => {
    const result = AvataxWebhookServiceFactory.createFromConfig(
      AppConfig.createFromParsedConfig({
        channels: mockedValidChannels,
        providerConnections: mockedProviders,
      }),
      "default-channel",
    );

    expect(result._unsafeUnwrap()).toBeDefined();
  });
});
