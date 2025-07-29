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
import { CreditCheckResult } from "@/modules/atobarai/api/atobarai-transaction-success-response";
import { IAtobaraiApiClient } from "@/modules/atobarai/api/types";
import { createAtobaraiCustomer } from "@/modules/atobarai/atobarai-customer";
import { createAtobaraiDeliveryDestination } from "@/modules/atobarai/atobarai-delivery-destination";
import {
  PartialRefundWithLineItemsGoodsBuilder,
  PartialRefundWithoutLineItemsGoodsBuilder,
} from "@/modules/atobarai/atobarai-goods/refund-goods-builders";
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
import { AfterFulfillmentRefundContext, RefundStrategy } from "./types";

export class AfterFulfillmentFullRefundStrategy implements RefundStrategy {
  private readonly logger = createLogger("AfterFulfillmentFullRefundStrategy");

  async execute(
    context: AfterFulfillmentRefundContext,
  ): Promise<Result<TransactionRefundRequestedUseCaseResponse, MalformedRequestResponse>> {
    const { atobaraiTransactionId, apiClient } = context;

    const payload = createAtobaraiCancelTransactionPayload({
      atobaraiTransactionId,
    });

    const cancelResult = await apiClient.cancelTransaction(payload, {
      checkForMultipleResults: true,
    });

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

    return ok(
      new TransactionRefundRequestedUseCaseResponse.Success({
        transactionResult: new RefundSuccessResult(),
        atobaraiTransactionId,
      }),
    );
  }
}

export class AfterFulfillmentPartialRefundWithLineItemsStrategy implements RefundStrategy {
  private readonly logger = createLogger("AfterFulfillmentPartialRefundWithLineItemsStrategy");
  private readonly goodsBuilder = new PartialRefundWithLineItemsGoodsBuilder();

  async execute(
    context: AfterFulfillmentRefundContext,
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
      grantedRefund: parsedEvent.grantedRefund!,
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

    const fullfillmentPayload = createAtobaraiFulfillmentReportPayload({
      atobaraiTransactionId: registerTransactionResult.value,
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
        atobaraiTransactionId: registerTransactionResult.value,
      }),
    );
  }

  private async cancelTransaction(
    atobaraiTransactionId: AtobaraiTransactionId,
    apiClient: IAtobaraiApiClient,
  ) {
    const cancelTransactionResult = await apiClient.cancelTransaction(
      createAtobaraiCancelTransactionPayload({ atobaraiTransactionId }),
      {
        checkForMultipleResults: true,
      },
    );

    if (cancelTransactionResult.isErr()) {
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
    const registerTransactionResult = await apiClient.registerTransaction(payload, {
      checkForMultipleResults: true,
    });

    if (registerTransactionResult.isErr()) {
      return err(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    const transaction = registerTransactionResult.value.results[0];

    if (transaction.authori_result === CreditCheckResult.Success) {
      return ok(createAtobaraiTransactionId(transaction.np_transaction_id));
    }

    return err(
      new TransactionRefundRequestedUseCaseResponse.Failure({
        transactionResult: new RefundFailureResult(),
      }),
    );
  }

  private async reportFullfillment(
    payload: AtobaraiFulfillmentReportPayload,
    apiClient: IAtobaraiApiClient,
  ) {
    const reportFullfillmentResult = await apiClient.reportFulfillment(payload, {
      checkForMultipleResults: true,
    });

    if (reportFullfillmentResult.isErr()) {
      return err(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    return ok(null);
  }
}

export class AfterFulfillmentPartialRefundWithoutLineItemsStrategy implements RefundStrategy {
  private readonly logger = createLogger("AfterFulfillmentPartialRefundWithoutLineItemsStrategy");
  private readonly goodsBuilder = new PartialRefundWithoutLineItemsGoodsBuilder();

  async execute(
    context: AfterFulfillmentRefundContext,
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

    const fullfillmentPayload = createAtobaraiFulfillmentReportPayload({
      atobaraiTransactionId: registerTransactionResult.value,
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
        atobaraiTransactionId: registerTransactionResult.value,
      }),
    );
  }

  private async cancelTransaction(
    atobaraiTransactionId: AtobaraiTransactionId,
    apiClient: IAtobaraiApiClient,
  ) {
    const cancelTransactionResult = await apiClient.cancelTransaction(
      createAtobaraiCancelTransactionPayload({ atobaraiTransactionId }),
      {
        checkForMultipleResults: true,
      },
    );

    if (cancelTransactionResult.isErr()) {
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
    const registerTransactionResult = await apiClient.registerTransaction(payload, {
      checkForMultipleResults: true,
    });

    if (registerTransactionResult.isErr()) {
      return err(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }
    const transaction = registerTransactionResult.value.results[0];

    if (transaction.authori_result === CreditCheckResult.Success) {
      return ok(createAtobaraiTransactionId(transaction.np_transaction_id));
    }

    return err(
      new TransactionRefundRequestedUseCaseResponse.Failure({
        transactionResult: new RefundFailureResult(),
      }),
    );
  }

  private async reportFullfillment(
    payload: AtobaraiFulfillmentReportPayload,
    apiClient: IAtobaraiApiClient,
  ) {
    const reportFullfillmentResult = await apiClient.reportFulfillment(payload, {
      checkForMultipleResults: true,
    });

    if (reportFullfillmentResult.isErr()) {
      return err(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult(),
        }),
      );
    }

    return ok(null);
  }
}
