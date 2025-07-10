import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { captureException } from "@sentry/nextjs";

import { TransactionInitializeSession } from "@/generated/app-webhooks-types/transaction-initialize-session";
import { createLogger } from "@/lib/logger";
import { withLoggerContext } from "@/lib/logger-context";

import { withRecipientVerification } from "../with-recipient-verification";
import { transactionInitializeSessionWebhookDefinition } from "./webhook-definition";

const logger = createLogger("TransactionInitializeSession route");

const handler = transactionInitializeSessionWebhookDefinition.createHandler(
  withRecipientVerification(async (_req, _ctx) => {
    try {
      const response = {
        result: "CHARGE_SUCCESS",
        pspReference: "CHANGE_ME",
      } satisfies TransactionInitializeSession;

      return Response.json(response, { status: 200 });
    } catch (error) {
      captureException(error);
      logger.error("Unhandled error", { error: error });

      return Response.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }),
);

export const POST = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
