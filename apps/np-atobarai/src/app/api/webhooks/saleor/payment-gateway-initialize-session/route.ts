import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { captureException } from "@sentry/nextjs";

import { PaymentGatewayInitializeSession } from "@/generated/app-webhooks-types/payment-gateway-initialize-session";
import { createLogger } from "@/lib/logger";
import { withLoggerContext } from "@/lib/logger-context";

import { withRecipientVerification } from "../with-recipient-vetification";
import { paymentGatewayInitializeSessionWebhookDefinition } from "./webhook-definition";

const logger = createLogger("PaymentGatewayInitializeSession route");

const handler = paymentGatewayInitializeSessionWebhookDefinition.createHandler(
  withRecipientVerification(async (_req, _ctx) => {
    try {
      const response = {
        data: {},
      } satisfies PaymentGatewayInitializeSession;

      return Response.json(response, { status: 200 });
    } catch (error) {
      captureException(error);
      logger.error("Unhandled error", { error: error });

      return Response.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }),
);

export const POST = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
