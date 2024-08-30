import { err, ok } from "neverthrow";

import { AvataxCalculationDateResolver } from "@/modules/avatax/avatax-calculation-date-resolver";
import { AvataxDocumentCodeResolver } from "@/modules/avatax/avatax-document-code-resolver";
import { AvataxEntityTypeMatcher } from "@/modules/avatax/avatax-entity-type-matcher";
import { AvataxCalculateTaxesAdapter } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-adapter";
import { AvataxCalculateTaxesPayloadService } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload.service";
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
import { AvataxTaxCodeMatchesService } from "@/modules/avatax/tax-code/avatax-tax-code-matches.service";

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

    const avaTaxSdk = new AvataxSdkClientFactory().createClient(
      channelConfig.value.avataxConfig.config,
    );
    const avaTaxClient = new AvataxClient(avaTaxSdk);

    /**
     * Compose dependencies - as much as possible lifted as high as possible.
     * Next steps of refactor - remove not needed classes and lift them even higher. And inject into use case
     */
    const taxProvider = new AvataxWebhookService(
      new AvataxCalculateTaxesAdapter(avaTaxClient, new AvataxCalculateTaxesResponseTransformer()),
      new AvataxCalculateTaxesPayloadTransformer(
        new AvataxCalculateTaxesPayloadLinesTransformer(new AvataxCalculateTaxesTaxCodeMatcher()),
        new AvataxEntityTypeMatcher(avaTaxClient),
      ),
      new AvataxOrderCancelledAdapter(avaTaxClient, new AvataxOrderCancelledPayloadTransformer()),
      new AvataxOrderConfirmedAdapter(
        avaTaxClient,
        new AvataxOrderConfirmedResponseTransformer(),
        new AvataxOrderConfirmedPayloadService(
          new AvataxOrderConfirmedPayloadTransformer(
            new SaleorOrderToAvataxLinesTransformer(),
            new AvataxEntityTypeMatcher(avaTaxClient),
            new AvataxCalculationDateResolver(),
            new AvataxDocumentCodeResolver(),
          ),
        ),
      ),
    );

    return ok({ taxProvider });
  }
}
