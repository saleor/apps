import { ChannelConfig } from "../channels-configuration/channels-config";
import { AvataxConfig } from "./avatax-config";
import { avataxMockTransactionFactory } from "./avatax-mock-transaction-factory";

const defaultChannelConfig: ChannelConfig = {
  providerInstanceId: "b8c29f49-7cae-4762-8458-e9a27eb83081",
  enabled: false,
  address: {
    country: "US",
    zip: "92093",
    state: "CA",
    city: "La Jolla",
    street: "9500 Gilman Drive",
  },
};

const createMockChannelConfig = (overrides: Partial<ChannelConfig> = {}): ChannelConfig => ({
  ...defaultChannelConfig,
  ...overrides,
});

export const avataxMockFactory = {
  createMockChannelConfig,
  ...avataxMockTransactionFactory,
};
