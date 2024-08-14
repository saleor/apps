import { err, ok } from "neverthrow";

import { BaseError } from "../../error";
import { AppConfig } from "../../lib/app-config";
import { AvataxClient } from "../avatax/avatax-client";
import { AvataxSdkClientFactory } from "../avatax/avatax-sdk-client-factory";
import { AvataxWebhookService } from "../avatax/avatax-webhook.service";

export class AvataxWebhookServiceFactory {
  static BrokenConfigurationError = BaseError.subclass("BrokenConfigurationError");

  static createFromConfig(config: AppConfig, channelSlug: string) {
    const channelConfig = config.getConfigForChannelSlug(channelSlug);

    if (channelConfig.isErr()) {
      return err(
        new this.BrokenConfigurationError(
          `Channel config was not found for channel ${channelSlug}`,
          {
            props: {
              channelSlug,
            },
          },
        ),
      );
    }

    const taxProvider = new AvataxWebhookService(
      new AvataxClient(
        new AvataxSdkClientFactory().createClient(channelConfig.value.avataxConfig.config),
      ),
    );

    return ok({ taxProvider });
  }
}
