import { BaseError } from "@saleor/errors";
import { err, ok, Result } from "neverthrow";

import { InvalidEventValidationError } from "@/app/api/webhooks/saleor/use-case-errors";
import { createLogger } from "@/lib/logger";
import { createAtobaraiCancelTransactionPayload } from "@/modules/atobarai/api/atobarai-cancel-transaction-payload";
import { createAtobaraiFulfillmentReportPayload } from "@/modules/atobarai/api/atobarai-fulfillment-report-payload";
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
import { createAtobaraiTransactionId } from "@/modules/atobarai/atobarai-transaction-id";
import { createSaleorTransactionToken } from "@/modules/saleor/saleor-transaction-token";
import {
  RefundFailureResult,
  RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";

import { TransactionRefundRequestedUseCaseResponse } from "../use-case-response";
import { AfterFulfillmentRefundContext, AfterFulfillmentRefundStrategy } from "./types";

/**
 * Handles case when there full refund (whole amount) after fulfillment has been sent.
 */
export class AfterFulfillmentFullRefundStrategy implements AfterFulfillmentRefundStrategy {
  private readonly logger = createLogger("AfterFulfillmentFullRefundStrategy");

  async execute(
    context: AfterFulfillmentRefundContext,
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

/**
 * Handles case when there is a granted refund with line items after fulfillment has been sent.
 *
 * @remarks
 * Calls to NP Atobarai API are not atomic so if one of the steps (cancel, register, fulfillment) fails, we return a failure response and staff user will need to either create new order in Saleor or manually fix the issue in Atobarai.
 */
export class AfterFulfillmentPartialRefundWithLineItemsStrategy
  implements AfterFulfillmentRefundStrategy
{
  private readonly logger = createLogger("AfterFulfillmentPartialRefundWithLineItemsStrategy");
  private readonly goodsBuilder = new PartialRefundWithLineItemsGoodsBuilder();

  async execute(
    context: AfterFulfillmentRefundContext,
  ): Promise<
    Result<
      TransactionRefundRequestedUseCaseResponse,
      InstanceType<typeof InvalidEventValidationError>
    >
  > {
    const {
      parsedEvent,
      appConfig,
      atobaraiTransactionId,
      apiClient,
      trackingNumber,
      shippingCompanyCode,
    } = context;

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

    const cancelTransactionResult = await apiClient.cancelTransaction(
      createAtobaraiCancelTransactionPayload({ atobaraiTransactionId }),
      {
        rejectMultipleResults: true,
      },
    );

    if (cancelTransactionResult.isErr()) {
      this.logger.warn("Failed to cancel Atobarai transaction", {
        error: cancelTransactionResult.error,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult({ reason: "cancelFailure" }),
        }),
      );
    }

    const amountAfterRefund = parsedEvent.sourceObjectTotalAmount - parsedEvent.refundedAmount;

    const atobaraiGoods = this.goodsBuilder.build({
      sourceObject: parsedEvent.sourceObject,
      useSkuAsName: appConfig.skuAsName,
      grantedRefund: parsedEvent.grantedRefund,
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
      this.logger.warn("Failed to register Atobarai transaction", {
        error: registerTransactionResult.error,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult({ reason: "registerFailure" }),
        }),
      );
    }

    const fulfillmentPayload = createAtobaraiFulfillmentReportPayload({
      atobaraiTransactionId: registerTransactionResult.value,
      trackingNumber,
      shippingCompanyCode,
    });

    const fulfillmentResult = await apiClient.reportFulfillment(fulfillmentPayload, {
      rejectMultipleResults: true,
    });

    if (fulfillmentResult.isErr()) {
      this.logger.warn("Failed to report Atobarai fulfillment", {
        error: fulfillmentResult.error,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult({ reason: "fulfillmentFailure" }),
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

  private async registerTransaction(
    payload: AtobaraiRegisterTransactionPayload,
    apiClient: IAtobaraiApiClient,
  ) {
    const registerTransactionResult = await apiClient.registerTransaction(payload, {
      rejectMultipleResults: true,
    });

    if (registerTransactionResult.isErr()) {
      return err(registerTransactionResult.error);
    }

    const transaction = registerTransactionResult.value.results[0];

    if (transaction.authori_result === CreditCheckResult.Success) {
      return ok(createAtobaraiTransactionId(transaction.np_transaction_id));
    }

    return err(
      new BaseError("Register transaction result is not successful", {
        props: {
          authori_result: transaction.authori_result,
        },
      }),
    );
  }
}

/**
 * Handles case when there is a no granted refund with line items after fulfillment has been sent.
 *
 * @remarks
 * Calls to NP Atobarai API are not atomic so if one of the steps (cancel, register, fulfillment) fails, we return a failure response and staff user will need to either create new order in Saleor or manually fix the issue in Atobarai.
 */
export class AfterFulfillmentPartialRefundWithoutLineItemsStrategy
  implements AfterFulfillmentRefundStrategy
{
  private readonly logger = createLogger("AfterFulfillmentPartialRefundWithoutLineItemsStrategy");
  private readonly goodsBuilder = new PartialRefundWithoutLineItemsGoodsBuilder();

  async execute(
    context: AfterFulfillmentRefundContext,
  ): Promise<
    Result<
      TransactionRefundRequestedUseCaseResponse,
      InstanceType<typeof InvalidEventValidationError>
    >
  > {
    const {
      parsedEvent,
      appConfig,
      atobaraiTransactionId,
      apiClient,
      trackingNumber,
      shippingCompanyCode,
    } = context;

    const cancelTransactionResult = await apiClient.cancelTransaction(
      createAtobaraiCancelTransactionPayload({ atobaraiTransactionId }),
      {
        rejectMultipleResults: true,
      },
    );

    if (cancelTransactionResult.isErr()) {
      this.logger.warn("Failed to cancel Atobarai transaction", {
        error: cancelTransactionResult.error,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult({
            reason: "cancelFailure",
          }),
        }),
      );
    }

    const amountAfterRefund = parsedEvent.sourceObjectTotalAmount - parsedEvent.refundedAmount;

    const atobaraiGoods = this.goodsBuilder.build({
      sourceObject: parsedEvent.sourceObject,
      useSkuAsName: appConfig.skuAsName,
      refundedAmount: parsedEvent.refundedAmount,
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
      this.logger.warn("Failed to register Atobarai transaction", {
        error: registerTransactionResult.error,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult({
            reason: "registerFailure",
          }),
        }),
      );
    }

    const fulfillmentPayload = createAtobaraiFulfillmentReportPayload({
      atobaraiTransactionId: registerTransactionResult.value,
      trackingNumber,
      shippingCompanyCode,
    });

    const fulfillmentResult = await apiClient.reportFulfillment(fulfillmentPayload, {
      rejectMultipleResults: true,
    });

    if (fulfillmentResult.isErr()) {
      this.logger.warn("Failed to report Atobarai fulfillment", {
        error: fulfillmentResult.error,
      });

      return ok(
        new TransactionRefundRequestedUseCaseResponse.Failure({
          transactionResult: new RefundFailureResult({
            reason: "fulfillmentFailure",
          }),
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

  private async registerTransaction(
    payload: AtobaraiRegisterTransactionPayload,
    apiClient: IAtobaraiApiClient,
  ) {
    const registerTransactionResult = await apiClient.registerTransaction(payload, {
      rejectMultipleResults: true,
    });

    if (registerTransactionResult.isErr()) {
      return err(registerTransactionResult.error);
    }
    const transaction = registerTransactionResult.value.results[0];

    if (transaction.authori_result === CreditCheckResult.Success) {
      return ok(createAtobaraiTransactionId(transaction.np_transaction_id));
    }

    return err(
      new BaseError("Register transaction result is not successful", {
        props: {
          authori_result: transaction.authori_result,
        },
      }),
    );
  }
}
