import { MetadataItem } from "../../../generated/graphql";
import { getAppConfig } from "../app/get-app-config";
import { AvataxWebhookService } from "../avatax/avatax-webhook.service";
import { BaseError } from "../../error";
import { createLogger } from "../../logger";
import { err, fromThrowable, ok } from "neverthrow";
import { AvataxClient } from "../avatax/avatax-client";
import { AvataxSdkClientFactory } from "../avatax/avatax-sdk-client-factory";
import { ActiveConnectionServiceErrors } from "./get-active-connection-service-errors";

export function getActiveConnectionService(
  channelSlug: string | undefined,
  encryptedMetadata: MetadataItem[],
) {
  const logger = createLogger("getActiveConnectionService");

  if (!channelSlug) {
    return err(
      new ActiveConnectionServiceErrors.MissingChannelSlugError(
        "Channel slug was not found in the webhook payload. This should not happen",
      ),
    );
  }

  if (!encryptedMetadata.length) {
    return err(
      new ActiveConnectionServiceErrors.MissingMetadataError(
        "App metadata was not found in Webhook payload. App was likely installed but never configured",
      ),
    );
  }

  const appConfigResult = fromThrowable(getAppConfig, (err) => BaseError.normalize(err))(
    encryptedMetadata,
  );

  if (appConfigResult.isErr()) {
    return err(appConfigResult.error);
  }

  const { providerConnections, channels } = appConfigResult.value;

  if (!channels.length) {
    return err(
      new ActiveConnectionServiceErrors.ProviderNotAssignedToChannelError(
        "Provider is not assigned to the channel. App is configured partially.",
      ),
    );
  }

  const channelConfig = channels.find((channel) => channel.config.slug === channelSlug);

  if (!channelConfig) {
    return err(
      new ActiveConnectionServiceErrors.WrongChannelError(
        `Channel config was not found for channel ${channelSlug}`,
        {
          props: {
            channelSlug,
          },
        },
      ),
    );
  }

  /**
   * Abstract to some config layer with repository operations
   */
  const providerConnection = providerConnections.find(
    (connection) => connection.id === channelConfig.config.providerConnectionId,
  );

  if (!providerConnection) {
    logger.debug(
      "In the providers array, there is no item with an id that matches the channel config providerConnectionId.",
      { providerConnections, channelConfig },
    );
    return err(
      new ActiveConnectionServiceErrors.BrokenConfigurationError(
        `Channel config providerConnectionId does not match any providers`,
        {
          props: {
            channelSlug: channelConfig.config.slug,
          },
        },
      ),
    );
  }

  const taxProvider = new AvataxWebhookService(
    new AvataxClient(new AvataxSdkClientFactory().createClient(providerConnection.config)),
  );

  /**
   * Adding config here, to have single place where its resolved.
   * TODO: Extract this
   */
  return ok({ taxProvider, config: providerConnection.config });
}
