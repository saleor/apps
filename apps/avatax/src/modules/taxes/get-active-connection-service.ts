import { AuthData } from "@saleor/app-sdk/APL";
import { MetadataItem } from "../../../generated/graphql";
import { GetAppConfig } from "../app/get-app-config";
import { AvataxService } from "../avatax/avatax-webhook.service";
import { AppConfig, ProviderConnection } from "../provider-connections/provider-connections";
import { createClientLogger } from "../logs/client-logger";
import { BaseError } from "../../error";
import { createLogger } from "../../logger";
import { err, fromThrowable, ok } from "neverthrow";
import { AvataxConfig } from "../avatax/avatax-connection-schema";

const ActiveConnectionServiceError = BaseError.subclass("ActiveConnectionServiceError");

/**
 * TODO: This error should be verified in validation level
 */
const MissingChannelSlugError = ActiveConnectionServiceError.subclass("MissingChannelSlugError");

const MissingMetadataError = ActiveConnectionServiceError.subclass("MissingMetadataError");

const ProviderNotAssignedToChannelError = ActiveConnectionServiceError.subclass(
  "ProviderNotAssignedToChannelError",
);

/**
 * Will happen when `order-created` webhook is triggered by creating an order in a channel that doesn't use the tax app
 */
const WrongChannelError = ActiveConnectionServiceError.subclass("WrongChannelError");

const BrokenConfigurationError = ActiveConnectionServiceError.subclass("BrokenConfigurationError");

type Errors =
  | typeof MissingChannelSlugError
  | typeof MissingMetadataError
  | typeof ProviderNotAssignedToChannelError
  | typeof WrongChannelError
  | typeof BrokenConfigurationError;

export const ActiveConnectionServiceErrors = {
  MissingChannelSlugError,
  MissingMetadataError,
  ProviderNotAssignedToChannelError,
  WrongChannelError,
  BrokenConfigurationError,
} as const;

export class ActiveConnectionServiceResolver {
  resolve(
    // TODO Channel slug should be always required here and validated higher
    channelSlug: string | undefined,
    authData: AuthData,
    appConfig: AppConfig,
  ) {
    const logger = createLogger("getActiveConnectionService");

    if (!channelSlug) {
      return err(
        new MissingChannelSlugError(
          "Channel slug was not found in the webhook payload. This should not happen",
        ),
      );
    }

    /*
     * if (!encryptedMetadata.length) {
     *   return err(
     *     new MissingMetadataError(
     *       "App metadata was not found in Webhook payload. App was likely installed but never configured",
     *     ),
     *   );
     * }
     *
     * const appConfigResult = fromThrowable(this.getAppConfig, (err) => BaseError.normalize(err))(
     *   encryptedMetadata,
     * );
     */

    /*
     * if (appConfigResult.isErr()) {
     *   return err(appConfigResult.error);
     * }
     */

    const { providerConnections, channels } = appConfig;

    if (!channels.length) {
      return err(
        new ProviderNotAssignedToChannelError(
          "Provider is not assigned to the channel. App is configured partially.",
        ),
      );
    }

    const channelConfig = channels.find((channel) => channel.config.slug === channelSlug);

    if (!channelConfig) {
      return err(
        new WrongChannelError(`Channel config was not found for channel ${channelSlug}`, {
          props: {
            channelSlug,
          },
        }),
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
        new BrokenConfigurationError(
          `Channel config providerConnectionId does not match any providers`,
          {
            props: {
              channelSlug: channelConfig.config.slug,
            },
          },
        ),
      );
    }

    const taxProvider = this.avataxProviderFactory({
      providerConnection,
      authData,
    });

    return ok(taxProvider);
  }

  private avataxProviderFactory = ({
    providerConnection,
    authData,
  }: {
    providerConnection: ProviderConnection;
    authData: AuthData;
  }) => {
    return new AvataxService({
      clientLogger: createClientLogger({
        authData,
        configurationId: providerConnection.id,
      }),
    });
  };
}
