import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { v7 as uuidv7 } from "uuid";
import { saleorApp } from "@/saleor-app";
import {
  TransactionCancelRequestedDocument,
  TransactionCancelRequestedEventFragment,
} from "@/generated/graphql";
import {
  CancelationRequestedResponse,
  cancelationRequestedInputSchema,
} from "@/modules/validation/cancel-webhook";
import { getZodErrorMessage } from "@/lib/zod-error";
import { getTransactionActions } from "@/lib/transaction-actions";
import { AppUrlGenerator } from "@/modules/url/app-url-generator";
import { createLogger } from "@/lib/logger/create-logger";
import { wrapWithLoggerContext } from "@/lib/logger/logger-context";
import { withOtel } from "@/lib/otel/otel-wrapper";
import { loggerContext } from "@/logger-context";

export const transactionCancelationRequestedWebhook =
  new SaleorSyncWebhook<TransactionCancelRequestedEventFragment>({
    name: "Transaction cancelation Requested",
    webhookPath: "api/webhooks/transaction-cancel-requested",
    event: "TRANSACTION_CANCELATION_REQUESTED",
    apl: saleorApp.apl,
    query: TransactionCancelRequestedDocument,
  });

export default wrapWithLoggerContext(
  withOtel(
    transactionCancelationRequestedWebhook.createHandler((req, res, ctx) => {
      const logger = createLogger("transaction-cancelation-requested");
      const { payload } = ctx;

      logger.debug("Received webhook", { payload });

      const payloadResult = cancelationRequestedInputSchema.safeParse(payload);

      if (payloadResult.error) {
        logger.warn("Data received from Saleor didn't pass validation", {
          error: payloadResult.error,
        });

        const failureResponse: CancelationRequestedResponse = {
          pspReference: uuidv7(),
          result: "CANCEL_FAILURE",
          message: getZodErrorMessage(payloadResult.error),
          actions: getTransactionActions("CANCEL_FAILURE"),
          amount: 0,
        };

        logger.info("Returning error response from Saleor", { response: failureResponse });

        return res.status(200).json(failureResponse);
      }

      const parsedPayload = payloadResult.data;
      const amount = parsedPayload.transaction.authorizedAmount.amount;
      const urlGenerator = new AppUrlGenerator(ctx.authData);

      const successResponse: CancelationRequestedResponse = {
        pspReference: uuidv7(),
        // TODO: Add result customization
        result: "CANCEL_SUCCESS",
        message: "Great success!",
        actions: getTransactionActions("CANCEL_SUCCESS"),
        amount,
        externalUrl: urlGenerator.getTransactionDetailsUrl(parsedPayload.transaction.id),
      };

      logger.info("Returning response to Saleor", { response: successResponse });

      return res.status(200).json(successResponse);
    }),
    "/api/webhooks/transaction-cancel-requested"
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
