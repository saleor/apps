import { StripeConfig } from "@/modules/app-config/stripe-config";

export class AppRootConfig {
  readonly configsByChannelId: Record<string, StripeConfig>;

  constructor(configsByChannelId: Record<string, StripeConfig>) {
    this.configsByChannelId = configsByChannelId;
  }

  getConfigByChannelId(channelId: string) {
    return this.configsByChannelId[channelId];
  }
}
