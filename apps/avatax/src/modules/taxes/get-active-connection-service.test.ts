import { encrypt } from "@saleor/app-sdk/settings-manager";
import { describe, expect, it, vi } from "vitest";
import { MetadataItem } from "../../../generated/graphql";
import { ChannelsConfig } from "../channel-configuration/channel-config";
import { ProviderConnections } from "../provider-connections/provider-connections";
import { getActiveConnectionService } from "./get-active-connection-service";
import { AuthData } from "@saleor/app-sdk/APL";
import { ActiveConnectionServiceErrors } from "./get-active-connection-service-errors";

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
  mockedSecretKey,
);

const mockedValidEncryptedChannels = encrypt(JSON.stringify(mockedValidChannels), mockedSecretKey);

const mockedAuthData: AuthData = {
  appId: "test-app-id",
  saleorApiUrl: "https://test.saleor.io/graphql/",
  token: "test-token",
};

vi.stubEnv("SECRET_KEY", mockedSecretKey);

describe("getActiveConnectionService", () => {
  it("throws MissingChannelSlugError error when channel slug is missing", () => {
    const result = getActiveConnectionService("", mockedInvalidMetadata);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(
      ActiveConnectionServiceErrors.MissingChannelSlugError,
    );
  });

  it("throws MissingMetadataError error when there are no metadata items", () => {
    const result = getActiveConnectionService("default-channel", []);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(
      ActiveConnectionServiceErrors.MissingMetadataError,
    );
  });

  it("throws BrokenConfigurationError error when no providerConnectionId was found", () => {
    const result = getActiveConnectionService("default-channel", [
      {
        key: "providers",
        value: mockedEncryptedProviders,
      },
      {
        key: "channels",
        value: mockedInvalidEncryptedChannels,
      },
    ]);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(
      ActiveConnectionServiceErrors.BrokenConfigurationError,
    );
  });

  it("throws WrongChannelError error when no channel was found for channelSlug", () => {
    const result = getActiveConnectionService("invalid-channel", [
      {
        key: "providers",
        value: mockedEncryptedProviders,
      },
      {
        key: "channels",
        value: mockedValidEncryptedChannels,
      },
    ]);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(
      ActiveConnectionServiceErrors.WrongChannelError,
    );
  });

  it("returns provider when data is correct", () => {
    const result = getActiveConnectionService("default-channel", [
      {
        key: "providers",
        value: mockedEncryptedProviders,
      },
      {
        key: "channels",
        value: mockedValidEncryptedChannels,
      },
    ]);

    expect(result._unsafeUnwrap()).toBeDefined();
  });
});
