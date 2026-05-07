import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "@/saleor-app";
import {
  TransactionEventTypeEnum,
  TransactionFlowStrategyEnum,
  TransactionInitializeSessionDocument,
  TransactionInitializeSessionEventFragment,
} from "@/generated/graphql";
import { v7 as uuidv7 } from "uuid";
import { getTransactionActions } from "@/lib/transaction-actions";
import { createLogger } from "@/lib/logger/create-logger";
import { getZodErrorMessage } from "@/lib/zod-error";
import { dataSchema } from "@/modules/validation/sync-transaction";
import { AppUrlGenerator } from "@/modules/url/app-url-generator";
import { wrapWithLoggerContext } from "@/lib/logger/logger-context";
import { withOtel } from "@/lib/otel/otel-wrapper";
import { loggerContext } from "@/logger-context";
import {
  TransactionSessionFailure,
  TransactionSessionSuccess,
} from "@/generated/app-webhooks-types/transaction-initialize-session";

export const transactionInitializeSessionWebhook =
  new SaleorSyncWebhook<TransactionInitializeSessionEventFragment>({
    name: "Transaction Initialize Session",
    webhookPath: "api/webhooks/transaction-initialize-session",
    event: "TRANSACTION_INITIALIZE_SESSION",
    apl: saleorApp.apl,
    query: TransactionInitializeSessionDocument,
  });

export default wrapWithLoggerContext(
  withOtel(
    transactionInitializeSessionWebhook.createHandler((req, res, ctx) => {
      const logger = createLogger("transaction-initialize-session");
      const { payload } = ctx;
      const { actionType, amount } = payload.action;

      logger.debug("Received webhook", { payload });

      const rawEventData = payload.data;
      const dataResult = dataSchema.safeParse(rawEventData);

      if (dataResult.error) {
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

      logger.info("Parsed data field from notification", { data });

      const urlGenerator = new AppUrlGenerator(ctx.authData);

      const successResponse: TransactionSessionSuccess = {
        pspReference: data.event.includePspReference ? uuidv7() : "psp-ref",
        result: data.event.type as TransactionSessionSuccess['result'],
        message: "Great success!",
        actions: getTransactionActions(data.event.type as TransactionEventTypeEnum),
        amount,
        externalUrl: urlGenerator.getTransactionDetailsUrl(payload.transaction.id),
        // todo allow to set from ui
        paymentMethodDetails: {
          type:"CARD",
          brand:"visa",
          name:"Card",
          expMonth: 4,
          expYear: 2030,
          firstDigits:"1234",
          lastDigits:"1234"
        },
      };

      logger.info("Returning response to Saleor", { response: successResponse });

      return res.status(200).json(successResponse);
    }),
    "/api/webhooks/transaction-initialize-session"
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
