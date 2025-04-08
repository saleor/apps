import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";

import { transactionInitializeSessionWebhookDefinition } from "@/app/api/saleor/transaction-initialize-session/webhook-definition";
import { withLoggerContext } from "@/lib/logger-context";

const handler = transactionInitializeSessionWebhookDefinition.createHandler(async () => {
  return Response.json({}, { status: 200 });
});

export const POST = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
