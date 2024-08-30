import { err, ok } from "neverthrow";

import { AvataxEntityTypeMatcher } from "@/modules/avatax/avatax-entity-type-matcher";
import { AvataxCalculateTaxesAdapter } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-adapter";
import { AvataxCalculateTaxesPayloadService } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload.service";
import { AvataxCalculateTaxesPayloadLinesTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload-lines-transformer";
import { AvataxCalculateTaxesPayloadTransformer } from "@/modules/avatax/calculate-taxes/avatax-calculate-taxes-payload-transformer";
import { AvataxOrderCancelledAdapter } from "@/modules/avatax/order-cancelled/avatax-order-cancelled-adapter";
import { AvataxOrderConfirmedAdapter } from "@/modules/avatax/order-confirmed/avatax-order-confirmed-adapter";
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

    const taxProvider = new AvataxWebhookService(
      new AvataxCalculateTaxesAdapter(avaTaxClient),
      new AvataxCalculateTaxesPayloadTransformer(
        new AvataxCalculateTaxesPayloadLinesTransformer(),
        new AvataxEntityTypeMatcher(avaTaxClient),
      ),
      new AvataxOrderCancelledAdapter(avaTaxClient),
      new AvataxOrderConfirmedAdapter(avaTaxClient),
    );

    return ok({ taxProvider });
  }
}
