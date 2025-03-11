import { AuthData } from "@saleor/app-sdk/APL";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";

import { loggerContext } from "@/logger-context";

import { createLogger } from "../../../logger";
import { SaleorOrderConfirmedEvent } from "../../saleor";
import { CreateOrderResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { PriceReductionDiscountsStrategy } from "../discounts";
import { extractTransactionRedactedLogProperties } from "../extract-transaction-redacted-log-properties";
import { AvataxOrderConfirmedPayloadService } from "./avatax-order-confirmed-payload.service";
import { AvataxOrderConfirmedResponseTransformer } from "./avatax-order-confirmed-response-transformer";

type AvataxOrderConfirmedPayload = {
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
    loggerContext.set(ObservabilityAttributes.ORDER_ID, payload.confirmedOrderEvent.getOrderId());
    loggerContext.set(
      ObservabilityAttributes.CHANNEL_SLUG,
      payload.confirmedOrderEvent.getChannelSlug(),
    );

    this.logger.debug("Transforming the Saleor payload for creating order with AvaTax...");

    const target = await this.avataxOrderConfirmedPayloadService.getPayload(
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

    const createTransactionResult = await this.avataxClient.createTransaction(target);

    if (createTransactionResult.isErr()) {
      throw createTransactionResult.error;
    }

    const transaction = createTransactionResult.value;

    this.logger.info("AvaTax createTransaction successfully responded", {
      taxCalculationSummary: transaction.summary,
    });

    const transformedResponse = this.avataxOrderConfirmedResponseTransformer.transform(transaction);

    this.logger.debug("Transformed AvaTax createTransaction response");

    return transformedResponse;
  }
}
