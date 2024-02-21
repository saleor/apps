import { AuthData } from "@saleor/app-sdk/APL";
import { MetadataItem } from "../../../generated/graphql";
import { getAppConfig } from "../app/get-app-config";
import { AvataxWebhookService } from "../avatax/avatax-webhook.service";
import { ProviderConnection } from "../provider-connections/provider-connections";
import { createClientLogger } from "../logs/client-logger";
import { BaseError } from "../../error";
import { createLogger } from "../../logger";
import { err, fromThrowable, ok } from "neverthrow";

const avataxProviderFactory = ({
  providerConnection,
  authData,
}: {
  providerConnection: ProviderConnection;
  authData: AuthData;
}) => {
  return new AvataxWebhookService({
    config: providerConnection.config,
    authData,
    clientLogger: createClientLogger({
      authData,
      configurationId: providerConnection.id,
    }),
  });
};

const ActiveConnectionServiceError = BaseError.subclass("ActiveConnectionServiceError");

export const ActiveConnectionServiceErrors = {
  /**
   * TODO: What does it mean?  How it should behave?
   */
  MissingChannelSlugError: ActiveConnectionServiceError.subclass("MissingChannelSlugError"),

  MissingMetadataError: ActiveConnectionServiceError.subclass("MissingMetadataError"),

  /**
   * TODO: What does it mean?  How it should behave?
   * Should it be handled as BrokenConfigurationError?
   */
  ProviderNotAssignedToChannelError: ActiveConnectionServiceError.subclass(
    "ProviderNotAssignedToChannelError",
  ),

  /**
   * Will happen when `order-created` webhook is triggered by creating an order in a channel that doesn't use the tax app
   */
  WrongChannelError: ActiveConnectionServiceError.subclass("WrongChannelError"),

  BrokenConfigurationError: ActiveConnectionServiceError.subclass("BrokenConfigurationError"),
} as const;

export type ActiveConnectionServiceErrorsUnion =
  (typeof ActiveConnectionServiceErrors)[keyof typeof ActiveConnectionServiceErrors];

export function getActiveConnectionService(
  channelSlug: string | undefined,
  encryptedMetadata: MetadataItem[],
  authData: AuthData,
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

  const taxProvider = avataxProviderFactory({
    providerConnection,
    authData,
  });

  return ok(taxProvider);
}
