import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";

import { withLoggerContext } from "@/lib/logger-context";

import { appDeletedWebhookDefinition } from "./webhook-definition";

export const POST = compose(
  withLoggerContext,
  withSpanAttributesAppRouter,
)(appDeletedWebhookDefinition.handler);
