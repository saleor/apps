import { StripeConfig } from "@/modules/app-config/stripe-config";

export class AppRootConfig {
  constructor(
    private deps: {
      configsByChannelId: Record<string, StripeConfig>;
    },
  ) {}

  getConfigs() {
    return this.deps.configsByChannelId;
  }

  getConfigByChannelId(channelId: string) {
    return this.deps.configsByChannelId[channelId];
  }
}
