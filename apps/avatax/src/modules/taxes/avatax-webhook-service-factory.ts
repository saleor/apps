import { err, ok } from "neverthrow";

import { AvataxCalculationDateResolver } from "@/modules/avatax/avatax-calculation-date-resolver";
import { AvataxDocumentCodeResolver } from "@/modules/avatax/avatax-document-code-resolver";
import { AvataxEntityTypeMatcher } from "@/modules/avatax/avatax-entity-type-matcher";
import { AvataxCalculateTaxesAdapter } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-adapter";
import { AvataxCalculateTaxesPayloadLinesTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload-lines-transformer";
import { AvataxCalculateTaxesPayloadTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload-transformer";
import { AvataxCalculateTaxesResponseTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-response-transformer";
import { AvataxCalculateTaxesTaxCodeMatcher } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-tax-code-matcher";
import { AvataxOrderCancelledAdapter } from "@/modules/avatax/order-cancelled/avatax-order-cancelled-adapter";
import { AvataxOrderCancelledPayloadTransformer } from "@/modules/avatax/order-cancelled/avatax-order-cancelled-payload-transformer";
import { AvataxOrderConfirmedAdapter } from "@/modules/avatax/order-confirmed/avatax-order-confirmed-adapter";
import { AvataxOrderConfirmedPayloadService } from "@/modules/avatax/order-confirmed/avatax-order-confirmed-payload.service";
import { AvataxOrderConfirmedPayloadTransformer } from "@/modules/avatax/order-confirmed/avatax-order-confirmed-payload-transformer";
import { AvataxOrderConfirmedResponseTransformer } from "@/modules/avatax/order-confirmed/avatax-order-confirmed-response-transformer";
import { SaleorOrderToAvataxLinesTransformer } from "@/modules/avatax/order-confirmed/saleor-order-to-avatax-lines-transformer";

import { BaseError } from "../../error";
import { AppConfig } from "../../lib/app-config";
import { AvataxClient } from "../avatax/avatax-client";
import { AvataxSdkClientFactory } from "../avatax/avatax-sdk-client-factory";
import { AvataxWebhookService } from "../avatax/avatax-webhook.service";

/**
 * Create root-level deps.
 * To be refactored - each use-case should require its own deps
 */
const createAvataxOrderConfirmedAdapter = (
  avaTaxClient: AvataxClient,
  entityTypeMatcher: AvataxEntityTypeMatcher,
) => {
  const orderToAvataxLinesTransformer = new SaleorOrderToAvataxLinesTransformer();
  const calculationDateResolver = new AvataxCalculationDateResolver();
  const documentCodeResolver = new AvataxDocumentCodeResolver();
  const avataxOrderConfirmedResponseTransformer = new AvataxOrderConfirmedResponseTransformer();
  const orderConfirmedPayloadTransformer = new AvataxOrderConfirmedPayloadTransformer(
    orderToAvataxLinesTransformer,
    entityTypeMatcher,
    calculationDateResolver,
    documentCodeResolver,
  );

  const avataxOrderConfirmedPayloadService = new AvataxOrderConfirmedPayloadService(
    orderConfirmedPayloadTransformer,
  );

  return new AvataxOrderConfirmedAdapter(
    avaTaxClient,
    avataxOrderConfirmedResponseTransformer,
    avataxOrderConfirmedPayloadService,
  );
};

const createAvataxOrderCancelledAdapter = (avaTaxClient: AvataxClient) => {
  const avataxOrderCancelledPayloadTransformer = new AvataxOrderCancelledPayloadTransformer();

  return new AvataxOrderCancelledAdapter(avaTaxClient, avataxOrderCancelledPayloadTransformer);
};

const createAvataxCalculateTaxesAdapter = (avaTaxClient: AvataxClient) => {
  const avataxCalculateTaxesResponseTransformer = new AvataxCalculateTaxesResponseTransformer();

  return new AvataxCalculateTaxesAdapter(avaTaxClient, avataxCalculateTaxesResponseTransformer);
};

const createAvataxCalculateTaxesPayloadTransformer = (
  entityTypeMatcher: AvataxEntityTypeMatcher,
) => {
  const avataxCalculateTaxesTaxCodeMatcher = new AvataxCalculateTaxesTaxCodeMatcher();
  const avataxCalculateTaxesPayloadLinesTransformer =
    new AvataxCalculateTaxesPayloadLinesTransformer(avataxCalculateTaxesTaxCodeMatcher);

  return new AvataxCalculateTaxesPayloadTransformer(
    avataxCalculateTaxesPayloadLinesTransformer,
    entityTypeMatcher,
  );
};

/**
 * TODO: Refactor, this should be removed and deps should be directly injected into use cases
 */
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

    const avaTaxSdk = new AvataxSdkClientFactory().createClient(
      channelConfig.value.avataxConfig.config,
    );
    const avaTaxClient = new AvataxClient(avaTaxSdk);
    const entityTypeMatcher = new AvataxEntityTypeMatcher(avaTaxClient);

    const taxProvider = new AvataxWebhookService(
      createAvataxCalculateTaxesAdapter(avaTaxClient),
      createAvataxCalculateTaxesPayloadTransformer(entityTypeMatcher),
      createAvataxOrderCancelledAdapter(avaTaxClient),
      createAvataxOrderConfirmedAdapter(avaTaxClient, entityTypeMatcher),
    );

    return ok({ taxProvider });
  }
}
