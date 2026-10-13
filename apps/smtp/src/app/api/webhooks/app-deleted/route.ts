import { wrapWithLoggerContextAppRouter } from "@saleor/apps-logger/node";

import { loggerContext } from "../../../../logger-context";
import { appDeletedWebhook } from "./webhook-definition";

export const POST = wrapWithLoggerContextAppRouter(appDeletedWebhook.handler, loggerContext);
