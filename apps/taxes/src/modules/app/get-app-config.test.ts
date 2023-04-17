import { encrypt } from "@saleor/app-sdk/settings-manager";
import { getAppConfig } from "./get-app-config";
import { describe, expect, it, vi } from "vitest";
import { ProvidersConfig } from "../providers-configuration/providers-config";
import { MetadataItem } from "../../../generated/graphql";
import { ChannelsConfig } from "../channels-configuration/channels-config";

const mockedSecretKey = "test_secret_key";
const mockedProviders: ProvidersConfig = [
  {
    provider: "avatax",
    id: "1",
    config: {
      companyCode: "DEFAULT",
      isAutocommit: false,
      isSandbox: true,
      name: "avatax-1",
      password: "avatax-password",
      username: "avatax-username",
    },
  },
  {
    provider: "taxjar",
    id: "2",
    config: {
      name: "taxjar-1",
      apiKey: "taxjar-api-key",
      isSandbox: true,
    },
  },
];
const mockedEncryptedProviders = encrypt(JSON.stringify(mockedProviders), mockedSecretKey);

const mockedChannels: ChannelsConfig = {
  "default-channel": {
    address: {
      city: "New York",
      country: "US",
      state: "NY",
      street: "123 Main St",
      zip: "10001",
    },
    enabled: true,
    providerInstanceId: "1",
  },
};

const mockedEncryptedChannels = encrypt(JSON.stringify(mockedChannels), mockedSecretKey);

const mockedMetadata: MetadataItem[] = [
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
  it("should return empty providers and channels config when no metadata", () => {
    const { providers, channels } = getAppConfig([]);

    expect(providers).toEqual([]);
    expect(channels).toEqual({});
  });

  it("should return decrypted providers and channels config when metadata provided", () => {
    const { providers, channels } = getAppConfig(mockedMetadata);

    expect(providers).toEqual(mockedProviders);
    expect(channels).toEqual(mockedChannels);
  });
});
