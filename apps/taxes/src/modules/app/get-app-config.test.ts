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

const mockedChannels: ChannelsConfig = {
  "default-channel": {
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
  it("returns empty providers and channels config when no metadata", () => {
    const { providers, channels } = getAppConfig([]);

    expect(providers).toEqual([]);
    expect(channels).toEqual({});
  });

  it("returns decrypted providers and channels config when metadata provided", () => {
    const { providers, channels } = getAppConfig(mockedMetadata);

    expect(providers).toEqual(mockedProviders);
    expect(channels).toEqual(mockedChannels);
  });
});
