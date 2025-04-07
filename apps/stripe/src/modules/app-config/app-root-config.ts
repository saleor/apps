import { StripeConfig } from "@/modules/app-config/stripe-config";

export class AppRootConfig {
  constructor(
    private props: {
      configsByChannelId: Record<string, StripeConfig>;
    },
  ) {}

  getConfigs() {
    return this.props.configsByChannelId;
  }

  getConfigByChannelId(channelId: string) {
    return this.props.configsByChannelId[channelId];
  }
}
