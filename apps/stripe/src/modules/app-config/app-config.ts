import { StripeConfig } from "@/modules/app-config/stripe-config";

export class AppConfig {
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
