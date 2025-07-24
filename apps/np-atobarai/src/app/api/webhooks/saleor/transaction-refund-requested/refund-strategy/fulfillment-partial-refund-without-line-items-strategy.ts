import { err, ok, Result } from "neverthrow";

import { createLogger } from "@/lib/logger";
import { createAtobaraiCancelTransactionPayload } from "@/modules/atobarai/api/atobarai-cancel-transaction-payload";
import {
  AtobaraiFulfillmentReportPayload,
  createAtobaraiFulfillmentReportPayload,
} from "@/modules/atobarai/api/atobarai-fulfillment-report-payload";
import {
  AtobaraiRegisterTransactionPayload,
  createAtobaraiRegisterTransactionPayload,
} from "@/modules/atobarai/api/atobarai-register-transaction-payload";
import { IAtobaraiApiClient } from "@/modules/atobarai/api/types";
import { createAtobaraiCustomer } from "@/modules/atobarai/atobarai-customer";
import { createAtobaraiDeliveryDestination } from "@/modules/atobarai/atobarai-delivery-destination";
import { PartialRefundWithoutLineItemsGoodsBuilder } from "@/modules/atobarai/atobarai-goods/refund-goods-builders";
import { createAtobaraiMoney } from "@/modules/atobarai/atobarai-money";
import { createAtobaraiShopOrderDate } from "@/modules/atobarai/atobarai-shop-order-date";
import {
  AtobaraiTransactionId,
  createAtobaraiTransactionId,
} from "@/modules/atobarai/atobarai-transaction-id";
import { createSaleorTransactionToken } from "@/modules/saleor/saleor-transaction-token";
import {
  RefundFailureResult,
  RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";

import { MalformedRequestResponse } from "../../saleor-webhook-responses";
import { TransactionRefundRequestedUseCaseResponse } from "../use-case-response";
import { FulfillmentRefundContext, RefundStrategy } from "./types";

export class FulfillmentPartialRefundWithoutLineItemsStrategy implements RefundStrategy {
  private readonly logger = createLogger("FulfillmentPartialRefundWithoutLineItemsStrategy");
  private readonly goodsBuilder = new PartialRefundWithoutLineItemsGoodsBuilder();

  async execute(
    context: FulfillmentRefundContext,
  ): Promise<Result<TransactionRefundRequestedUseCaseResponse, MalformedRequestResponse>> {
    const {
      parsedEvent,
      appConfig,
      atobaraiTransactionId,
      apiClient,
      trackingNumber,
      shippingCompanyCode,
    } = context;

    const cancelTransactionResult = await this.cancelTransaction(atobaraiTransactionId, apiClient);

    if (cancelTransactionResult.isErr()) {
      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    const amountAfterRefund = parsedEvent.sourceObjectTotalAmount - parsedEvent.refundedAmount;

    const atobaraiGoods = this.goodsBuilder.build({
      sourceObject: parsedEvent.sourceObject,
      useSkuAsName: appConfig.skuAsName,
      amountAfterRefund,
    });

    const payload = createAtobaraiRegisterTransactionPayload({
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

    const registerTransactionResult = await this.registerTransaction(payload, apiClient);

    if (registerTransactionResult.isErr()) {
      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    const newTransactionId = createAtobaraiTransactionId(registerTransactionResult.value);

    const fullfillmentPayload = createAtobaraiFulfillmentReportPayload({
      atobaraiTransactionId: newTransactionId,
      trackingNumber,
      shippingCompanyCode,
    });

    const fulfillmentResult = await this.reportFullfillment(fullfillmentPayload, apiClient);

    if (fulfillmentResult.isErr()) {
      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    return ok(
      new TransactionRefundRequestedUseCaseResponse.Success({
        transactionResult: new RefundSuccessResult(),
        atobaraiTransactionId: newTransactionId,
      }),
    );
  }

  private async cancelTransaction(
    atobaraiTransactionId: AtobaraiTransactionId,
    apiClient: IAtobaraiApiClient,
  ) {
    const cancelTransactionResult = await apiClient.cancelTransaction(
      createAtobaraiCancelTransactionPayload({ atobaraiTransactionId }),
    );

    if (cancelTransactionResult.isErr()) {
      return err(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    if (cancelTransactionResult.value.results.length > 1) {
      this.logger.warn("Multiple results returned from Atobarai cancel transaction", {
        results: cancelTransactionResult.value.results,
      });

      return err(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    return ok(null);
  }

  private async registerTransaction(
    payload: AtobaraiRegisterTransactionPayload,
    apiClient: IAtobaraiApiClient,
  ) {
    const registerTransactionResult = await apiClient.registerTransaction(payload);

    if (registerTransactionResult.isErr()) {
      return err(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    if (registerTransactionResult.value.results.length > 1) {
      this.logger.warn("Multiple results returned from Atobarai register transaction", {
        results: registerTransactionResult.value.results,
      });

      return err(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    // TODO: check value of new register transaction
    return ok(registerTransactionResult.value.results[0].np_transaction_id);
  }

  private async reportFullfillment(
    payload: AtobaraiFulfillmentReportPayload,
    apiClient: IAtobaraiApiClient,
  ) {
    const reportFullfillmentResult = await apiClient.reportFulfillment(payload);

    if (reportFullfillmentResult.isErr()) {
      return err(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    if (reportFullfillmentResult.value.results.length > 1) {
      this.logger.warn("Multiple results returned from Atobarai report fullfillment", {
        results: reportFullfillmentResult.value.results,
      });

      return err(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    // TODO: check value of new register transaction
    return ok(reportFullfillmentResult.value.results[0].np_transaction_id);
  }
}
