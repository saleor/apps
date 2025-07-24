import { ok, Result } from "neverthrow";

import { createLogger } from "@/lib/logger";
import {
  AtobaraiChangeTransactionPayload,
  createAtobaraiChangeTransactionPayload,
} from "@/modules/atobarai/api/atobarai-change-transaction-payload";
import { IAtobaraiApiClient } from "@/modules/atobarai/api/types";
import { createAtobaraiCustomer } from "@/modules/atobarai/atobarai-customer";
import { createAtobaraiDeliveryDestination } from "@/modules/atobarai/atobarai-delivery-destination";
import { PartialRefundWithLineItemsGoodsBuilder } from "@/modules/atobarai/atobarai-goods/refund-goods-builders";
import { createAtobaraiMoney } from "@/modules/atobarai/atobarai-money";
import { createAtobaraiShopOrderDate } from "@/modules/atobarai/atobarai-shop-order-date";
import { AtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { createSaleorTransactionToken } from "@/modules/saleor/saleor-transaction-token";
import {
  RefundFailureResult,
  RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";

import { MalformedRequestResponse } from "../../saleor-webhook-responses";
import { TransactionRefundRequestedUseCaseResponse } from "../use-case-response";
import { NonFulfillmentRefundContext, RefundStrategy } from "./types";

export class NoFulfillmentPartialRefundWithLineItemsStrategy implements RefundStrategy {
  private readonly logger = createLogger("NoFulfillmentPartialRefundWithLineItemsStrategy");
  private readonly goodsBuilder = new PartialRefundWithLineItemsGoodsBuilder();

  async execute(
    context: NonFulfillmentRefundContext,
  ): Promise<Result<TransactionRefundRequestedUseCaseResponse, MalformedRequestResponse>> {
    const { parsedEvent, appConfig, atobaraiTransactionId, apiClient } = context;

    if (!parsedEvent.grantedRefund) {
      this.logger.error("No granted refund found in the event");

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
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
