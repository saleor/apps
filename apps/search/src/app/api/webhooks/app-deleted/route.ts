import { wrapWithLoggerContextAppRouter } from "@saleor/apps-logger/node";

import { loggerContext } from "../../../../lib/logger-context";
import { appDeletedWebhook } from "./webhook-definition";

export const POST = wrapWithLoggerContextAppRouter(appDeletedWebhook.handler, loggerContext);
