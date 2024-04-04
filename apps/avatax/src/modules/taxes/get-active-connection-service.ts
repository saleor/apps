import { AuthData } from "@saleor/app-sdk/APL";
import { AvataxWebhookService } from "../avatax/avatax-webhook.service";
import { err } from "neverthrow";
import { AppConfig } from "../../lib/app-config";
import { BaseError } from "../../error";

export const MissingChannelSlugError = BaseError.subclass("MissingChannelSlugError");
export const CantCreateConnectionServiceError = BaseError.subclass(
  "CantCreateConnectionServiceError",
);

export function getActiveConnectionService(
  channelSlug: string | undefined,
  authData: AuthData,
  config: AppConfig,
) {
  if (!channelSlug) {
    return err(
      new MissingChannelSlugError(
        "Channel slug was not found in the webhook payload. This should not happen",
        {
          props: {
            channelSlug,
          },
        },
      ),
    );
  }

  return config
    .getConfigForChannelSlug(channelSlug)
    .map((config) => {
      return new AvataxWebhookService({ config: config.avataxConfig.config, authData });
    })
    .mapErr(
      (error) =>
        new CantCreateConnectionServiceError(
          "Cant create connection to avatax due to broken config",
          {
            cause: error,
          },
        ),
    );
}
