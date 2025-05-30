import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";

import { createLogger } from "../logger";
import { AppConfig } from "./app-config";

export class AppConfigurationLogger {
  constructor(
    private injectedLogger: Pick<ReturnType<typeof createLogger>, "info" | "warn" | "debug">,
  ) {}

  logConfiguration(configuration: AppConfig, channelSlug: string) {
    const config = configuration.getConfigForChannelSlug(channelSlug);

    if (config.isErr()) {
      this.injectedLogger.warn("Failed to resolve configuration properly", {
        error: config.error,
        [ObservabilityAttributes.CHANNEL_SLUG]: channelSlug,
      });

      return;
    }

    const resolvedAvataxConfig = config.value.avataxConfig;

    this.injectedLogger.debug("Received configuration", {
      [ObservabilityAttributes.CHANNEL_SLUG]: channelSlug,
      /**
       * Be careful changing these values. They are likely used as a metric in Datadog
       */

      appConfigName: resolvedAvataxConfig.config.name,
      shippingTaxCode: resolvedAvataxConfig.config.shippingTaxCode,
      companyCode: resolvedAvataxConfig.config.companyCode,
      address: resolvedAvataxConfig.config.address,
      isSandbox: resolvedAvataxConfig.config.isSandbox,
      isAutocommit: resolvedAvataxConfig.config.isAutocommit,
      isDocumentRecordingEnabled: resolvedAvataxConfig.config.isDocumentRecordingEnabled,
      username: resolvedAvataxConfig.config.credentials.username.slice(0, 3) + "...",
      password: resolvedAvataxConfig.config.credentials.password ? "<Exists>" : "<EMPTY>",
    });
  }
}
