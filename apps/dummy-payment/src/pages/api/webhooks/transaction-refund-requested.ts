import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { v7 as uuidv7 } from "uuid";
import { saleorApp } from "@/saleor-app";
import {
  TransactionRefundRequestedDocument,
  TransactionRefundRequestedEventFragment,
} from "@/generated/graphql";
import { createLogger } from "@/lib/logger/create-logger";
import {
  RefundRequestedResponse,
  refundRequestedInputSchema,
} from "@/modules/validation/refund-webhook";
import { TransactionRefundChecker } from "@/modules/transaction/transaction-refund-checker";
import { getZodErrorMessage } from "@/lib/zod-error";
import { getTransactionActions } from "@/lib/transaction-actions";
import { AppUrlGenerator } from "@/modules/url/app-url-generator";
import { wrapWithLoggerContext } from "@/lib/logger/logger-context";
import { withOtel } from "@/lib/otel/otel-wrapper";
import { loggerContext } from "@/logger-context";

export const transactionRefundRequestedWebhook =
  new SaleorSyncWebhook<TransactionRefundRequestedEventFragment>({
    name: "Transaction Refund Requested",
    webhookPath: "api/webhooks/transaction-refund-requested",
    event: "TRANSACTION_REFUND_REQUESTED",
    apl: saleorApp.apl,
    query: TransactionRefundRequestedDocument,
  });

export default wrapWithLoggerContext(
  withOtel(
    transactionRefundRequestedWebhook.createHandler((req, res, ctx) => {
      const logger = createLogger("transaction-refund-requested");
      const { payload } = ctx;
      const { amount } = payload.action;

      const transactionRefundChecker = new TransactionRefundChecker();

      logger.debug("Received webhook", { payload });

      const payloadResult = refundRequestedInputSchema.safeParse(payload);

      if (payloadResult.error) {
        logger.warn("Data received from Saleor didn't pass validation", {
          error: payloadResult.error,
        });

        const failureResponse: RefundRequestedResponse = {
          pspReference: uuidv7(),
          result: "REFUND_FAILURE",
          message: getZodErrorMessage(payloadResult.error),
          actions: getTransactionActions("REFUND_FAILURE"),
          amount,
        };

        logger.info("Returning error response from Saleor", { response: failureResponse });

        return res.status(200).json(failureResponse);
      }

      const parsedPayload = payloadResult.data;
      const urlGenerator = new AppUrlGenerator(ctx.authData);

      const successResponse: RefundRequestedResponse = {
        pspReference: uuidv7(),
        // TODO: Add result customization
        result: "REFUND_SUCCESS",
        message: "Great success!",
        actions: transactionRefundChecker.checkIfAnotherRefundIsPossible(
          amount,
          payload.transaction?.chargedAmount
        )
          ? ["REFUND"]
          : [],
        amount,
        externalUrl: urlGenerator.getTransactionDetailsUrl(parsedPayload.transaction.id),
      };

      logger.info("Returning response to Saleor", { response: successResponse });

      return res.status(200).json(successResponse);
    }),

    "/api/wb/transaction-refund-requested"
  ),
  loggerContext
);

/**
 * Disable body parser for this endpoint, so signature can be verified
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
