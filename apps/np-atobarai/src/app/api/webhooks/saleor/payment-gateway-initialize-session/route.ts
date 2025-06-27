import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { captureException } from "@sentry/nextjs";

import { createLogger } from "@/lib/logger";
import { withLoggerContext } from "@/lib/logger-context";

import { withRecipientVerification } from "../with-recipient-vetification";
import { paymentGatewayInitializeSessionWebhookDefinition } from "./webhook-definition";

const logger = createLogger("PaymentGatewayInitializeSession route");

const handler = paymentGatewayInitializeSessionWebhookDefinition.createHandler(
  withRecipientVerification(async (_req, _ctx) => {
    try {
      return Response.json({ message: "This webhook is not implemented yet" }, { status: 200 });
    } catch (error) {
      captureException(error);
      logger.error("Unhandled error", { error: error });

      return Response.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }),
);

export const POST = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
