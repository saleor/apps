import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { captureException } from "@sentry/nextjs";

import { TransactionRefundRequested } from "@/generated/app-webhooks-types/transaction-refund-requested";
import { createLogger } from "@/lib/logger";
import { withLoggerContext } from "@/lib/logger-context";

import { withRecipientVerification } from "../with-recipient-verification";
import { transactionRefundRequestedWebhookDefinition } from "./webhook-definition";

const logger = createLogger("TransactionRefundRequested route");

const handler = transactionRefundRequestedWebhookDefinition.createHandler(
  withRecipientVerification(async (_req, ctx) => {
    try {
      const response = {
        result: "REFUND_SUCCESS",
        pspReference: "CHANGE_ME",
      } satisfies TransactionRefundRequested;

      logger.info("Transaction refund requested webhook received", {
        payload: ctx.payload,
      });

      return Response.json(response, { status: 200 });
    } catch (error) {
      captureException(error);
      logger.error("Unhandled error", { error: error });

      return Response.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }),
);

export const POST = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
