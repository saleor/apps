import { AuthData } from "@saleor/app-sdk/APL";
import { AvataxWebhookService } from "../avatax/avatax-webhook.service";
import { err, ok } from "neverthrow";
import { ActiveConnectionServiceErrors } from "./get-active-connection-service-errors";
import { AppConfig } from "../../lib/app-config";

export function getActiveConnectionService(
  channelSlug: string | undefined,
  authData: AuthData,
  config: AppConfig,
) {
  if (!channelSlug) {
    return err(
      new ActiveConnectionServiceErrors.MissingChannelSlugError(
        "Channel slug was not found in the webhook payload. This should not happen",
      ),
    );
  }

  return config.getConfigForChannelSlug(channelSlug).map((config) => {
    return new AvataxWebhookService({ config: config.avataxConfig.config, authData });
  });
}
