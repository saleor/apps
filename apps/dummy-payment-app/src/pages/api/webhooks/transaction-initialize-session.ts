import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import { v7 as uuidv7 } from "uuid";

import {
  type TransactionSessionFailure,
  type TransactionSessionSuccess,
} from "@/generated/app-webhooks-types/transaction-initialize-session";
import {
  type TransactionEventTypeEnum,
  TransactionFlowStrategyEnum,
  TransactionInitializeSessionDocument,
  type TransactionInitializeSessionEventFragment,
} from "@/generated/graphql";
import { getTransactionActions } from "@/lib/transaction-actions";
import { getZodErrorMessage } from "@/lib/zod-error";
import { createLogger } from "@/logger";
import { loggerContext } from "@/logger-context";
import { AppUrlGenerator } from "@/modules/url/app-url-generator";
import { dataSchema } from "@/modules/validation/sync-transaction";
import { saleorApp } from "@/saleor-app";

export const transactionInitializeSessionWebhook =
  new SaleorSyncWebhook<TransactionInitializeSessionEventFragment>({
    name: "Transaction Initialize Session",
    webhookPath: "api/webhooks/transaction-initialize-session",
    event: "TRANSACTION_INITIALIZE_SESSION",
    apl: saleorApp.apl,
    query: TransactionInitializeSessionDocument,
  });

export default wrapWithLoggerContext(
  withSpanAttributes(
    transactionInitializeSessionWebhook.createHandler((_req, res, ctx) => {
      const logger = createLogger("transaction-initialize-session");
      const { payload } = ctx;
      const { actionType, amount } = payload.action;

      logger.debug("Received webhook");

      const rawEventData = payload.data;
      const dataResult = dataSchema.safeParse(rawEventData);

      if (!dataResult.success) {
        logger.warn("Invalid data field received in notification", { error: dataResult.error });

        const errorResponse: TransactionSessionFailure = {
          pspReference: uuidv7(),
          result:
            actionType === TransactionFlowStrategyEnum.Charge
              ? "CHARGE_FAILURE"
              : "AUTHORIZATION_FAILURE",
          message: getZodErrorMessage(dataResult.error),
          amount,
          actions: [],
          data: {
            exception: true,
          },
        };

        logger.info("Returning error response to Saleor", { response: errorResponse });

        return res.status(200).json(errorResponse);
      }

      const data = dataResult.data;

      logger.info("Parsed data field from notification", { eventType: data.event.type });

      const urlGenerator = new AppUrlGenerator(ctx.authData);

      const successResponse: TransactionSessionSuccess = {
        pspReference: data.event.includePspReference ? uuidv7() : "psp-ref",
        result: data.event.type as TransactionSessionSuccess["result"],
        message: "Great success!",
        actions: getTransactionActions(data.event.type as TransactionEventTypeEnum),
        amount,
        externalUrl: urlGenerator.getTransactionDetailsUrl(payload.transaction.id),
        // todo allow to set from ui
        paymentMethodDetails: {
          type: "CARD",
          brand: "visa",
          name: "Card",
          expMonth: 4,
          expYear: 2030,
          firstDigits: "1234",
          lastDigits: "1234",
        },
      };

      logger.info("Returning response to Saleor", { response: successResponse });

      return res.status(200).json(successResponse);
    }),
  ),
  loggerContext,
);

/**
 * Disable body parser for this endpoint, so signature can be verified
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
