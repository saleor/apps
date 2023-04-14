import { encrypt } from "@saleor/app-sdk/settings-manager";
import { describe, expect, it, vi } from "vitest";
import { MetadataItem } from "../../../generated/graphql";
import { ChannelsConfig } from "../channels-configuration/channels-config";
import { ProvidersConfig } from "../providers-configuration/providers-config";
import { getActiveTaxProvider } from "./active-tax-provider";

const mockedInvalidMetadata: MetadataItem[] = [
  {
    key: "providers",
    value: JSON.stringify({
      foo: "bar",
    }),
  },
];

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

const mockedChannelsWithInvalidProviderInstanceId: ChannelsConfig = {
  "default-channel": {
    address: {
      city: "New York",
      country: "US",
      state: "NY",
      street: "123 Main St",
      zip: "10001",
    },
    enabled: true,
    providerInstanceId: "3",
  },
};

const mockedValidChannels: ChannelsConfig = {
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

const mockedInvalidEncryptedChannels = encrypt(
  JSON.stringify(mockedChannelsWithInvalidProviderInstanceId),
  mockedSecretKey
);

const mockedValidEncryptedChannels = encrypt(JSON.stringify(mockedValidChannels), mockedSecretKey);

vi.stubEnv("SECRET_KEY", mockedSecretKey);

describe("getActiveTaxProvider", () => {
  it("should return ok: false when channel slug is missing", () => {
    const result = getActiveTaxProvider("", mockedInvalidMetadata);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("channel_slug_missing");
    }
  });

  it("should return ok: false when there are no metadata items", () => {
    const result = getActiveTaxProvider("default-channel", []);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("app_encrypted_metadata_missing");
    }
  });

  it("should return ok: false when no providerInstanceId was found", () => {
    const result = getActiveTaxProvider("default-channel", [
      {
        key: "providers",
        value: mockedEncryptedProviders,
      },
      {
        key: "channels",
        value: mockedInvalidEncryptedChannels,
      },
    ]);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("no_match_for_channel_provider_instance_id");
    }
  });

  it("should return ok: false when no channel was found for channelSlug", () => {
    const result = getActiveTaxProvider("invalid-channel", [
      {
        key: "providers",
        value: mockedEncryptedProviders,
      },
      {
        key: "channels",
        value: mockedValidEncryptedChannels,
      },
    ]);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("channel_config_not_found");
    }
  });

  it("should return ok: true when data is correct", () => {
    const result = getActiveTaxProvider("default-channel", [
      {
        key: "providers",
        value: mockedEncryptedProviders,
      },
      {
        key: "channels",
        value: mockedValidEncryptedChannels,
      },
    ]);

    expect(result.ok).toBe(true);
  });
});
