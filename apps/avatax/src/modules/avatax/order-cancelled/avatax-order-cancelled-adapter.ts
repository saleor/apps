import { BaseError } from "@/error";
import { AvataxEntityNotFoundError } from "@/modules/taxes/tax-error";

import { createLogger } from "../../../logger";
import { CancelOrderPayload } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxClient, VoidTransactionArgs } from "../avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "../avatax-connection-schema";
import { AvataxOrderCancelledPayloadTransformer } from "./avatax-order-cancelled-payload-transformer";

export type AvataxOrderCancelledTarget = VoidTransactionArgs;

export class AvataxOrderCancelledAdapter implements WebhookAdapter<{ avataxId: string }, void> {
  private logger = createLogger("AvataxOrderCancelledAdapter");

  static AvaTaxOrderCancelledAdapterError = BaseError.subclass("AvaTaxOrderCancelledAdapterError");
  static DocumentNotFoundError =
    this.AvaTaxOrderCancelledAdapterError.subclass("DocumentNotFoundError");

  constructor(
    private avataxClient: Pick<AvataxClient, "voidTransaction">,
    private avataxOrderCancelledPayloadTransformer: AvataxOrderCancelledPayloadTransformer,
  ) {}

  async send({ payload, config }: { payload: CancelOrderPayload; config: AvataxConfig }) {
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

    const voidTransactionResult = await this.avataxClient.voidTransaction(target);

    if (voidTransactionResult.isErr()) {
      /**
       * This can happen when AvaTax doesn't have document on their side.
       * We can't do anything about - hence custom handling of this error
       */
      if (voidTransactionResult.error instanceof AvataxEntityNotFoundError) {
        /**
         * TODO Replace with neverthrow one day
         */
        throw new AvataxOrderCancelledAdapter.DocumentNotFoundError(
          "AvaTax didnt find the document to void",
          {
            props: {
              error: voidTransactionResult.error,
            },
          },
        );
      }

      throw voidTransactionResult.error;
    }
  }
}
