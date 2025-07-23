import { ok, Result } from "neverthrow";

import { createLogger } from "@/lib/logger";
import { createAtobaraiCancelTransactionPayload } from "@/modules/atobarai/api/atobarai-cancel-transaction-payload";
import {
  AtobaraiChangeTransactionPayload,
  createAtobaraiChangeTransactionPayload,
} from "@/modules/atobarai/api/atobarai-change-transaction-payload";
import { IAtobaraiApiClient } from "@/modules/atobarai/api/types";
import { createAtobaraiCustomer } from "@/modules/atobarai/atobarai-customer";
import { createAtobaraiDeliveryDestination } from "@/modules/atobarai/atobarai-delivery-destination";
import { createAtobaraiMoney } from "@/modules/atobarai/atobarai-money";
import { createAtobaraiShopOrderDate } from "@/modules/atobarai/atobarai-shop-order-date";
import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { createSaleorTransactionToken } from "@/modules/saleor/saleor-transaction-token";
import {
  RefundFailureResult,
  RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";

import { MalformedRequestResponse } from "../saleor-webhook-responses";
import { AtobaraiGoodsBuilder } from "./atobarai-goods-builder";
import { RefundContext, RefundStrategy } from "./refund-strategy";
import { TransactionRefundRequestedUseCaseResponse } from "./use-case-response";

export class NoFulfillmentFullRefundStrategy implements RefundStrategy {
  private readonly logger = createLogger("NoFulfillmentFullRefundStrategy");

  canHandle(context: RefundContext): boolean {
    const { parsedEvent, hasFulfillmentReported } = context;

    return (
      !hasFulfillmentReported && parsedEvent.refundedAmount === parsedEvent.sourceObjectTotalAmount
    );
  }

  async execute(
    context: RefundContext,
  ): Promise<Result<TransactionRefundRequestedUseCaseResponse, MalformedRequestResponse>> {
    const { atobaraiTransactionId, apiClient } = context;

    const payload = createAtobaraiCancelTransactionPayload({
      atobaraiTransactionId,
    });

    const cancelResult = await apiClient.cancelTransaction(payload);

    if (cancelResult.isErr()) {
      this.logger.error("Failed to cancel Atobarai transaction", {
        error: cancelResult.error,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    if (cancelResult.value.results.length > 1) {
      this.logger.warn("Multiple results returned from Atobarai cancel transaction", {
        results: cancelResult.value.results,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
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

export class NoFulfillmentPartialRefundWithLineItemsStrategy implements RefundStrategy {
  private readonly logger = createLogger("NoFulfillmentPartialRefundWithLineItemsStrategy");
  private readonly goodsBuilder = new AtobaraiGoodsBuilder();

  canHandle(context: RefundContext): boolean {
    const { parsedEvent, hasFulfillmentReported } = context;

    return (
      !hasFulfillmentReported &&
      parsedEvent.refundedAmount < parsedEvent.sourceObjectTotalAmount &&
      parsedEvent.grantedRefund !== null
    );
  }

  async execute(
    context: RefundContext,
  ): Promise<Result<TransactionRefundRequestedUseCaseResponse, MalformedRequestResponse>> {
    const { parsedEvent, appConfig, atobaraiTransactionId, apiClient } = context;

    const amountAdjusted = parsedEvent.sourceObjectTotalAmount - parsedEvent.refundedAmount;

    const atobaraiGoods = this.goodsBuilder.buildForNoFullfilmentPartialRefundWithLineItems({
      sourceObject: parsedEvent.sourceObject,
      useSkuAsName: appConfig.skuAsName,
      grantedRefund: parsedEvent.grantedRefund!,
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

    return this.executeChangeTransaction(payload, apiClient, atobaraiTransactionId);
  }

  private async executeChangeTransaction(
    payload: AtobaraiChangeTransactionPayload,
    apiClient: IAtobaraiApiClient,
    atobaraiTransactionId: AtobaraiTransactionId,
  ) {
    const changeTransactionResult = await apiClient.changeTransaction(payload);

    if (changeTransactionResult.isErr()) {
      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    if (changeTransactionResult.value.results.length > 1) {
      this.logger.warn("Multiple results returned from Atobarai change transaction", {
        results: changeTransactionResult.value.results,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
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

export class NoFulfillmentPartialRefundWithoutLineItemsStrategy implements RefundStrategy {
  private readonly logger = createLogger("NoFulfillmentPartialRefundWithoutLineItemsStrategy");
  private readonly goodsBuilder = new AtobaraiGoodsBuilder();

  canHandle(context: RefundContext): boolean {
    const { parsedEvent, hasFulfillmentReported } = context;

    return (
      !hasFulfillmentReported &&
      parsedEvent.refundedAmount < parsedEvent.sourceObjectTotalAmount &&
      !parsedEvent.grantedRefund
    );
  }

  async execute(
    context: RefundContext,
  ): Promise<Result<TransactionRefundRequestedUseCaseResponse, MalformedRequestResponse>> {
    const { parsedEvent, appConfig, atobaraiTransactionId, apiClient } = context;

    const amountAdjusted = parsedEvent.sourceObjectTotalAmount - parsedEvent.refundedAmount;

    const atobaraiGoods = this.goodsBuilder.buildForNoFulfillmentPartialRefundWithoutLineItems({
      sourceObject: parsedEvent.sourceObject,
      useSkuAsName: appConfig.skuAsName,
      amountAdjusted,
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

    return this.executeChangeTransaction(payload, apiClient, atobaraiTransactionId);
  }

  private async executeChangeTransaction(
    payload: AtobaraiChangeTransactionPayload,
    apiClient: IAtobaraiApiClient,
    atobaraiTransactionId: AtobaraiTransactionId,
  ) {
    const changeTransactionResult = await apiClient.changeTransaction(payload);

    if (changeTransactionResult.isErr()) {
      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    if (changeTransactionResult.value.results.length > 1) {
      this.logger.warn("Multiple results returned from Atobarai change transaction", {
        results: changeTransactionResult.value.results,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
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
