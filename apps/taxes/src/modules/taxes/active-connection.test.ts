import { encrypt } from "@saleor/app-sdk/settings-manager";
import { describe, expect, it, vi } from "vitest";
import { MetadataItem } from "../../../generated/graphql";
import { ChannelsConfig } from "../channel-configuration/channel-config";
import { ProviderConnections } from "../provider-connections/provider-connections";
import { getActiveConnection } from "./active-connection";

const mockedInvalidMetadata: MetadataItem[] = [
  {
    key: "providers",
    value: JSON.stringify({
      foo: "bar",
    }),
  },
];

const mockedSecretKey = "test_secret_key";
const mockedProviders: ProviderConnections = [
  {
    provider: "avatax",
    id: "1",
    config: {
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
  {
    provider: "taxjar",
    id: "2",
    config: {
      name: "taxjar-1",
      isSandbox: true,
      credentials: {
        apiKey: "taxjar-api-key",
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
const mockedEncryptedProviders = encrypt(JSON.stringify(mockedProviders), mockedSecretKey);

const mockedChannelsWithInvalidproviderConnectionId: ChannelsConfig = [
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

const mockedInvalidEncryptedChannels = encrypt(
  JSON.stringify(mockedChannelsWithInvalidproviderConnectionId),
  mockedSecretKey
);

const mockedValidEncryptedChannels = encrypt(JSON.stringify(mockedValidChannels), mockedSecretKey);

vi.stubEnv("SECRET_KEY", mockedSecretKey);

describe("getActiveConnection", () => {
  it("throws error when channel slug is missing", () => {
    expect(() => getActiveConnection("", mockedInvalidMetadata)).toThrow(
      "Channel slug was not found in the webhook payload"
    );
  });

  it("throws error when there are no metadata items", () => {
    expect(() => getActiveConnection("default-channel", [])).toThrow(
      "App encryptedMetadata was not found in the webhook payload"
    );
  });

  it("throws error when no providerConnectionId was found", () => {
    expect(() =>
      getActiveConnection("default-channel", [
        {
          key: "providers",
          value: mockedEncryptedProviders,
        },
        {
          key: "channels",
          value: mockedInvalidEncryptedChannels,
        },
      ])
    ).toThrow("Channel config providerConnectionId does not match any providers");
  });

  it("throws error when no channel was found for channelSlug", () => {
    expect(() =>
      getActiveConnection("invalid-channel", [
        {
          key: "providers",
          value: mockedEncryptedProviders,
        },
        {
          key: "channels",
          value: mockedValidEncryptedChannels,
        },
      ])
    ).toThrow("Channel config was not found for channel invalid-channel");
  });

  it("returns provider when data is correct", () => {
    const result = getActiveConnection("default-channel", [
      {
        key: "providers",
        value: mockedEncryptedProviders,
      },
      {
        key: "channels",
        value: mockedValidEncryptedChannels,
      },
    ]);

    expect(result).toBeDefined();
  });
});
