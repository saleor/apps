import { BaseError } from "@/error";
import { AvataxErrorsParser } from "@/modules/avatax/avatax-errors-parser";
import { AvataxEntityNotFoundError } from "@/modules/taxes/tax-error";

import { createLogger } from "../../../logger";
import { CancelOrderPayload } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxClient, VoidTransactionArgs } from "../avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "../avatax-connection-schema";
import { normalizeAvaTaxError } from "../avatax-error-normalizer";
import { AvataxOrderCancelledPayloadTransformer } from "./avatax-order-cancelled-payload-transformer";

export type AvataxOrderCancelledTarget = VoidTransactionArgs;

export class AvataxOrderCancelledAdapter implements WebhookAdapter<{ avataxId: string }, void> {
  private logger = createLogger("AvataxOrderCancelledAdapter");
  private errorParser = new AvataxErrorsParser();

  static AvaTaxOrderCancelledAdapterError = BaseError.subclass("AvaTaxOrderCancelledAdapterError");
  static DocumentNotFoundError =
    this.AvaTaxOrderCancelledAdapterError.subclass("DocumentNotFoundError");

  constructor(
    private avataxClient: Pick<AvataxClient, "voidTransaction">,
    private avataxOrderCancelledPayloadTransformer: AvataxOrderCancelledPayloadTransformer,
  ) {}

  async send(payload: CancelOrderPayload, config: AvataxConfig) {
    this.logger.info("Transforming the Saleor payload for cancelling transaction with AvaTax...");

    const target = this.avataxOrderCancelledPayloadTransformer.transform(
      payload,
      config.companyCode ?? defaultAvataxConfig.companyCode,
    );

    this.logger.info(
      "Calling AvaTax voidTransaction with transformed payload for order cancelled event",
      {
        transactionCode: target.transactionCode,
        companyCode: target.companyCode,
        avataxId: payload.avataxId,
      },
    );

    try {
      await this.avataxClient.voidTransaction(target);

      this.logger.info("Successfully voided the transaction", {
        transactionCode: target.transactionCode,
        companyCode: target.companyCode,
        avataxId: payload.avataxId,
      });
    } catch (e) {
      const parsedError = this.errorParser.parse(e);

      /**
       * This can happen when AvaTax doesn't have document on their side.
       * We can't do anything about - hence custom handling of this error
       */
      if (parsedError instanceof AvataxEntityNotFoundError) {
        /**
         * TODO Replace with neverthrow one day
         */
        throw new AvataxOrderCancelledAdapter.DocumentNotFoundError(
          "AvaTax didnt find the document to void",
          {
            props: {
              error: e,
            },
          },
        );
      }

      const error = normalizeAvaTaxError(e);

      this.logger.error("Error voiding the transaction", {
        transactionCode: target.transactionCode,
        companyCode: target.companyCode,
        avataxId: payload.avataxId,
        error,
      });

      throw error;
    }
  }
}
