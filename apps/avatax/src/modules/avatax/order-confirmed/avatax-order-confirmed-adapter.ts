import { AuthData } from "@saleor/app-sdk/APL";

import { AvataxCalculationDateResolver } from "@/modules/avatax/avatax-calculation-date-resolver";
import { AvataxDocumentCodeResolver } from "@/modules/avatax/avatax-document-code-resolver";
import { AvataxEntityTypeMatcher } from "@/modules/avatax/avatax-entity-type-matcher";
import { AvataxOrderConfirmedPayloadTransformer } from "@/modules/avatax/order-confirmed/avatax-order-confirmed-payload-transformer";
import { SaleorOrderToAvataxLinesTransformer } from "@/modules/avatax/order-confirmed/saleor-order-to-avatax-lines-transformer";

import { createLogger } from "../../../logger";
import {
  DeprecatedOrderConfirmedSubscriptionFragment,
  SaleorOrderConfirmedEvent,
} from "../../saleor";
import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { normalizeAvaTaxError } from "../avatax-error-normalizer";
import { PriceReductionDiscountsStrategy } from "../discounts";
import { extractTransactionRedactedLogProperties } from "../extract-transaction-redacted-log-properties";
import { AvataxOrderConfirmedPayloadService } from "./avatax-order-confirmed-payload.service";
import { AvataxOrderConfirmedResponseTransformer } from "./avatax-order-confirmed-response-transformer";

type AvataxOrderConfirmedPayload = {
  /**
   * @deprecated use `SaleorOrderConfirmedEvent` instead
   */
  order: DeprecatedOrderConfirmedSubscriptionFragment;
  confirmedOrderEvent: SaleorOrderConfirmedEvent;
};
type AvataxOrderConfirmedResponse = CreateOrderResponse;

export class AvataxOrderConfirmedAdapter
  implements WebhookAdapter<AvataxOrderConfirmedPayload, AvataxOrderConfirmedResponse>
{
  private logger = createLogger("AvataxOrderConfirmedAdapter");

  constructor(
    private avataxClient: AvataxClient,
    private avataxOrderConfirmedResponseTransformer: AvataxOrderConfirmedResponseTransformer,
    private avataxOrderConfirmedPayloadService: AvataxOrderConfirmedPayloadService,
  ) {}

  async send(
    payload: AvataxOrderConfirmedPayload,
    config: AvataxConfig,
    authData: AuthData,
    discountsStrategy: PriceReductionDiscountsStrategy,
  ): Promise<AvataxOrderConfirmedResponse> {
    this.logger.debug("Transforming the Saleor payload for creating order with AvaTax...");

    const target = await this.avataxOrderConfirmedPayloadService.getPayload(
      payload.order,
      payload.confirmedOrderEvent,
      config,
      authData,
      discountsStrategy,
    );

    this.logger.info(
      "Calling AvaTax createTransaction with transformed payload for order confirmed event",
      {
        ...extractTransactionRedactedLogProperties(target.model),
      },
    );

    try {
      const response = await this.avataxClient.createTransaction(target);

      this.logger.info("AvaTax createTransaction successfully responded", {
        taxCalculationSummary: response.summary,
      });

      const transformedResponse = this.avataxOrderConfirmedResponseTransformer.transform(response);

      this.logger.debug("Transformed AvaTax createTransaction response");

      return transformedResponse;
    } catch (e) {
      const error = normalizeAvaTaxError(e);

      throw error;
    }
  }
}
