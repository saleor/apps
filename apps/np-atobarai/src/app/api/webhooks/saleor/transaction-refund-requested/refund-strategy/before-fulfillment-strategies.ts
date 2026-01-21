import { ok, Result } from "neverthrow";

import { InvalidEventValidationError } from "@/app/api/webhooks/saleor/use-case-errors";
import { createLogger } from "@/lib/logger";
import { createAtobaraiCancelTransactionPayload } from "@/modules/atobarai/api/atobarai-cancel-transaction-payload";
import {
  AtobaraiChangeTransactionPayload,
  createAtobaraiChangeTransactionPayload,
} from "@/modules/atobarai/api/atobarai-change-transaction-payload";
import { IAtobaraiApiClient } from "@/modules/atobarai/api/types";
import { createAtobaraiCustomer } from "@/modules/atobarai/atobarai-customer";
import { createAtobaraiDeliveryDestination } from "@/modules/atobarai/atobarai-delivery-destination";
import {
  PartialRefundWithLineItemsGoodsBuilder,
  PartialRefundWithoutLineItemsGoodsBuilder,
} from "@/modules/atobarai/atobarai-goods/refund-goods-builders";
import { createAtobaraiMoney } from "@/modules/atobarai/atobarai-money";
import { createAtobaraiShopOrderDate } from "@/modules/atobarai/atobarai-shop-order-date";
import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { createSaleorTransactionToken } from "@/modules/saleor/saleor-transaction-token";
import {
  RefundFailureResult,
  RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";

import { TransactionRefundRequestedUseCaseResponse } from "../use-case-response";
import { BeforeFulfillmentRefundContext, BeforeFulfillmentRefundStrategy } from "./types";

export class BeforeFulfillmentFullRefundStrategy implements BeforeFulfillmentRefundStrategy {
  private readonly logger = createLogger("BeforeFulfillmentFullRefundStrategy");

  async execute(
    context: BeforeFulfillmentRefundContext,
  ): Promise<
    Result<
      TransactionRefundRequestedUseCaseResponse,
      InstanceType<typeof InvalidEventValidationError>
    >
  > {
    const { atobaraiTransactionId, apiClient } = context;

    const payload = createAtobaraiCancelTransactionPayload({
      atobaraiTransactionId,
    });

    const cancelResult = await apiClient.cancelTransaction(payload, {
      rejectMultipleResults: true,
    });

    if (cancelResult.isErr()) {
      this.logger.warn("Failed to cancel Atobarai transaction", {
        error: cancelResult.error,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult({
            reason: "cancelFailure",
          }),
        }),
      );
    }

    return ok(
      new TransactionRefundRequestedUseCaseResponse.Success({
        transactionResult: new RefundSuccessResult(),
        atobaraiTransactionId,
      }),
    );
  }
}

export class BeforeFulfillmentPartialRefundWithLineItemsStrategy
  implements BeforeFulfillmentRefundStrategy
{
  private readonly logger = createLogger("BeforeFulfillmentPartialRefundWithLineItemsStrategy");
  private readonly goodsBuilder = new PartialRefundWithLineItemsGoodsBuilder();

  async execute(
    context: BeforeFulfillmentRefundContext,
  ): Promise<
    Result<
      TransactionRefundRequestedUseCaseResponse,
      InstanceType<typeof InvalidEventValidationError>
    >
  > {
    const { parsedEvent, appConfig, atobaraiTransactionId, apiClient } = context;

    if (!parsedEvent.grantedRefund) {
      this.logger.error("No granted refund found in the event");

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult({
            reason: "missingData",
          }),
        }),
      );
    }

    const amountAdjusted = parsedEvent.sourceObjectTotalAmount - parsedEvent.refundedAmount;

    const atobaraiGoods = this.goodsBuilder.build({
      sourceObject: parsedEvent.sourceObject,
      useSkuAsName: appConfig.skuAsName,
      grantedRefund: parsedEvent.grantedRefund,
    });

    const payload = createAtobaraiChangeTransactionPayload({
      atobaraiTransactionId,
      saleorTransactionToken: createSaleorTransactionToken(parsedEvent.transactionToken),
      atobaraiMoney: createAtobaraiMoney({
        amount: amountAdjusted,
        currency: parsedEvent.currency,
      }),
      atobaraiCustomer: createAtobaraiCustomer({ sourceObject: parsedEvent.sourceObject }),
      atobaraiDeliveryDestination: createAtobaraiDeliveryDestination({
        sourceObject: parsedEvent.sourceObject,
      }),
      atobaraiGoods,
      atobaraiShopOrderDate: createAtobaraiShopOrderDate(parsedEvent.issuedAt),
    });

    return this.changeTransaction(payload, apiClient, atobaraiTransactionId);
  }

  private async changeTransaction(
    payload: AtobaraiChangeTransactionPayload,
    apiClient: IAtobaraiApiClient,
    atobaraiTransactionId: AtobaraiTransactionId,
  ) {
    const changeTransactionResult = await apiClient.changeTransaction(payload, {
      rejectMultipleResults: true,
    });

    if (changeTransactionResult.isErr()) {
      this.logger.warn("Failed to change Atobarai transaction", {
        error: changeTransactionResult.error,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult({ reason: "changeTransaction" }),
        }),
      );
    }

    return ok(
      new TransactionRefundRequestedUseCaseResponse.Success({
        transactionResult: new RefundSuccessResult(),
        atobaraiTransactionId,
      }),
    );
  }
}

export class BeforeFulfillmentPartialRefundWithoutLineItemsStrategy
  implements BeforeFulfillmentRefundStrategy
{
  private readonly logger = createLogger("BeforeFulfillmentPartialRefundWithoutLineItemsStrategy");
  private readonly goodsBuilder = new PartialRefundWithoutLineItemsGoodsBuilder();

  async execute(
    context: BeforeFulfillmentRefundContext,
  ): Promise<
    Result<
      TransactionRefundRequestedUseCaseResponse,
      InstanceType<typeof InvalidEventValidationError>
    >
  > {
    const { parsedEvent, appConfig, atobaraiTransactionId, apiClient } = context;

    const amountAfterRefund = parsedEvent.sourceObjectTotalAmount - parsedEvent.refundedAmount;

    const atobaraiGoods = this.goodsBuilder.build({
      sourceObject: parsedEvent.sourceObject,
      useSkuAsName: appConfig.skuAsName,
      refundedAmount: parsedEvent.refundedAmount,
    });

    const payload = createAtobaraiChangeTransactionPayload({
      atobaraiTransactionId,
      saleorTransactionToken: createSaleorTransactionToken(parsedEvent.transactionToken),
      atobaraiMoney: createAtobaraiMoney({
        amount: amountAfterRefund,
        currency: parsedEvent.currency,
      }),
      atobaraiCustomer: createAtobaraiCustomer({ sourceObject: parsedEvent.sourceObject }),
      atobaraiDeliveryDestination: createAtobaraiDeliveryDestination({
        sourceObject: parsedEvent.sourceObject,
      }),
      atobaraiGoods,
      atobaraiShopOrderDate: createAtobaraiShopOrderDate(parsedEvent.issuedAt),
    });

    return this.changeTransaction(payload, apiClient, atobaraiTransactionId);
  }

  private async changeTransaction(
    payload: AtobaraiChangeTransactionPayload,
    apiClient: IAtobaraiApiClient,
    atobaraiTransactionId: AtobaraiTransactionId,
  ) {
    const changeTransactionResult = await apiClient.changeTransaction(payload, {
      rejectMultipleResults: true,
    });

    if (changeTransactionResult.isErr()) {
      this.logger.warn("Failed to change Atobarai transaction", {
        error: changeTransactionResult.error,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult({
            reason: "changeTransaction",
          }),
        }),
      );
    }

    return ok(
      new TransactionRefundRequestedUseCaseResponse.Success({
        transactionResult: new RefundSuccessResult(),
        atobaraiTransactionId,
      }),
    );
  }
}
