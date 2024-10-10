import { encrypt } from "@saleor/app-sdk/settings-manager";
import { describe, expect, it, vi } from "vitest";

import { MetadataItemFragmentType } from "../../../graphql/fragments/MetadataItem";
import { ChannelsConfig } from "../channel-configuration/channel-config";
import { ProviderConnections } from "../provider-connections/provider-connections";
import { getAppConfig } from "./get-app-config";

const mockedSecretKey = "test_secret_key";
const mockedProviders: ProviderConnections = [
  {
    provider: "avatax",
    id: "1",
    config: {
      companyCode: "DEFAULT",
      isAutocommit: false,
      isSandbox: true,
      isDocumentRecordingEnabled: true,
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

const mockedChannels: ChannelsConfig = [
  {
    id: "1",
    config: {
      providerConnectionId: "1",
      slug: "default-channel",
    },
  },
];

const mockedEncryptedChannels = encrypt(JSON.stringify(mockedChannels), mockedSecretKey);

const mockedMetadata: MetadataItemFragmentType[] = [
  {
    key: "providers",
    value: mockedEncryptedProviders,
  },
  {
    key: "channels",
    value: mockedEncryptedChannels,
  },
];

vi.stubEnv("SECRET_KEY", mockedSecretKey);

describe("getAppConfig", () => {
  it("returns empty providerConnections and channels config when no metadata", () => {
    const { providerConnections, channels } = getAppConfig([]);

    expect(providerConnections).toEqual([]);
    expect(channels).toEqual({});
  });

  it("returns decrypted providerConnections and channels config when metadata provided", () => {
    const { providerConnections, channels } = getAppConfig(mockedMetadata);

    expect(providerConnections).toEqual(mockedProviders);
    expect(channels).toEqual(mockedChannels);
  });
});
