import { AuthData } from "@saleor/app-sdk/APL";
import { MetadataItem, OrderConfirmedSubscriptionFragment } from "../../../generated/graphql";

import { CalculateTaxesPayload } from "../../pages/api/webhooks/checkout-calculate-taxes";
import { OrderCancelledPayload } from "../../pages/api/webhooks/order-cancelled";
import { getAppConfig } from "../app/get-app-config";
import { AvataxWebhookService } from "../avatax/avatax-webhook.service";
import { ProviderConnection } from "../provider-connections/provider-connections";
import { ProviderWebhookService } from "./tax-provider-webhook";
import { createClientLogger } from "../logs/client-logger";
import { BaseError, ExpectedError } from "../../error";
import { createLogger } from "../../logger";
import { err, fromThrowable, ok, Result } from "neverthrow";

/**
 * TODO: Probably this abstraction should be removed
 */
class ActiveTaxProviderService implements ProviderWebhookService {
  private logger = createLogger("ActiveTaxProviderService");
  private client: AvataxWebhookService;

  constructor(
    providerConnection: ProviderConnection,
    private authData: AuthData,
  ) {
    const clientLogger = createClientLogger({
      authData,
      configurationId: providerConnection.id,
    });

    this.logger.debug("Selecting AvaTax as tax provider");
    this.client = new AvataxWebhookService({
      config: providerConnection.config,
      authData: this.authData,
      clientLogger,
    });
  }

  async calculateTaxes(payload: CalculateTaxesPayload) {
    return this.client.calculateTaxes(payload);
  }

  async confirmOrder(order: OrderConfirmedSubscriptionFragment) {
    return this.client.confirmOrder(order);
  }

  async cancelOrder(payload: OrderCancelledPayload) {
    return this.client.cancelOrder(payload);
  }
}

const ActiveConnectionServiceError = BaseError.subclass("ActiveConnectionServiceError");

export const ActiveConnectionServiceErrors = {
  /**
   * TODO: What does it mean?  How it should behave?
   */
  MissingChannelSlugError: ActiveConnectionServiceError.subclass("MissingChannelSlugError"),

  MissingMetadataError: ActiveConnectionServiceError.subclass("MissingMetadataError"),

  ProviderNotAssignedToChannelError: ActiveConnectionServiceError.subclass(
    "ProviderNotAssignedToChannelError",
  ),

  /**
   * Will happen when `order-created` webhook is triggered by creating an order in a channel that doesn't use the tax app
   */
  WrongChannelError: ActiveConnectionServiceError.subclass("WrongChannelError"),

  BrokenConfigurationError: ActiveConnectionServiceError.subclass("BrokenConfigurationError"),
};

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
        "Channel slug was not found in the webhook payload",
      ),
    );
  }

  if (!encryptedMetadata.length) {
    return err(
      new ActiveConnectionServiceErrors.MissingMetadataError(
        "App metadata was not found in Webhook payload. App is misconfigured or broken.",
      ),
    );
  }

  const appConfigResult = fromThrowable(getAppConfig, (err) => BaseError.normalize(err))(
    encryptedMetadata,
  );

  appConfigResult.mapErr((error) => {
    return err(error);
  });

  const { providerConnections, channels } = appConfigResult._unsafeUnwrap();

  if (!channels.length) {
    return err(
      new ActiveConnectionServiceErrors.ProviderNotAssignedToChannelError(
        "Provider is not assigned to the channel. App is misconfigured",
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

  const taxProvider = new ActiveTaxProviderService(providerConnection, authData);

  return ok(taxProvider);
}
