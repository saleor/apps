import { PayPalConfig } from "@/modules/app-config/domain/paypal-config";

export class PayPalAppRootConfig {
  readonly channelConfigMapping: Record<string, string>;
  readonly paypalConfigsById: Record<string, PayPalConfig>;

  constructor(
    channelConfigMapping: Record<string, string>,
    paypalConfigsById: Record<string, PayPalConfig>,
  ) {
    this.channelConfigMapping = channelConfigMapping;
    this.paypalConfigsById = paypalConfigsById;
  }

  getAllConfigsAsList(): PayPalConfig[] {
    return Object.values(this.paypalConfigsById);
  }

  getChannelsBoundToGivenConfig(configId: string): string[] {
    const keyValues = Object.entries(this.channelConfigMapping);
    const filtered = keyValues.filter(([_, value]) => value === configId);

    return filtered.map(([channelId]) => channelId);
  }

  getConfigIdForChannel(channelId: string): string | null {
    return this.channelConfigMapping[channelId] || null;
  }

  getConfigForChannel(channelId: string): PayPalConfig | null {
    const configId = this.getConfigIdForChannel(channelId);
    if (!configId) {
      return null;
    }
    return this.paypalConfigsById[configId] || null;
  }

  static createEmpty(): PayPalAppRootConfig {
    return new PayPalAppRootConfig({}, {});
  }
}