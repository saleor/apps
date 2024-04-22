import { AvataxWebhookService } from "../avatax/avatax-webhook.service";
import { createLogger } from "../../logger";
import { err, ok } from "neverthrow";
import { AvataxClient } from "../avatax/avatax-client";
import { AvataxSdkClientFactory } from "../avatax/avatax-sdk-client-factory";
import { ActiveConnectionServiceErrors } from "./get-active-connection-service-errors";
import { AppConfig } from "../../lib/app-config";

// todo rename file
export class AvataxWebhookServiceFactory {
  static createFromConfig(config: AppConfig, channelSlug: string) {
    if (!channelSlug) {
      return err(
        new ActiveConnectionServiceErrors.MissingChannelSlugError(
          "Channel slug was not found in the webhook payload. This should not happen",
        ),
      );
    }

    const channelConfig = config.getConfigForChannelSlug(channelSlug);

    if (channelConfig.isErr()) {
      return err(
        new ActiveConnectionServiceErrors.BrokenConfigurationError(
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

    /**
     * Adding config here, to have single place where its resolved.
     * TODO: Extract this
     */
    return ok({ taxProvider, config: channelConfig.value.avataxConfig.config });
  }
}
