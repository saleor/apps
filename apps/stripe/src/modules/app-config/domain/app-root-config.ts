import { StripeConfig } from "@/modules/app-config/domain/stripe-config";

export class AppRootConfig {
  readonly chanelConfigMapping: Record<string, string>;
  readonly stripeConfigsById: Record<string, StripeConfig>;

  constructor(
    chanelConfigMapping: Record<string, string>,
    stripeConfigsById: Record<string, StripeConfig>,
  ) {
    this.chanelConfigMapping = chanelConfigMapping;
    this.stripeConfigsById = stripeConfigsById;
  }

  getAllConfigsAsList() {
    return Object.values(this.stripeConfigsById);
  }

  getChannelsBoundToGivenConfig(configId: string) {
    const keyValues = Object.entries(this.chanelConfigMapping);
    const filtered = keyValues.filter(([_, value]) => value === configId);

    return filtered.map(([channelId]) => channelId);
  }
}
