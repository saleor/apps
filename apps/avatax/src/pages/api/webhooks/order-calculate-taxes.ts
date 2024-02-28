import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { UntypedCalculateTaxesDocument } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { getActiveConnectionService } from "../../../modules/taxes/get-active-connection-service";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { withOtel } from "@saleor/apps-otel";
import { createLogger } from "../../../logger";
import { calculateTaxesErrorsStrategy } from "../../../modules/webhooks/calculate-taxes-errors-strategy";
import * as Sentry from "@sentry/nextjs";
import { verifyCalculateTaxesPayload } from "../../../modules/webhooks/validate-webhook-payload";
import { CalculateTaxesPayload } from "../../../modules/webhooks/calculate-taxes-payload";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { loggerContext } from "../../../logger-context";
import {
  CalculateTaxesUseCase,
  CalculateTaxesUseCaseErrors,
} from "../../../use-cases/calculate-taxes/calculate-taxes.use-case";
import { BaseError } from "../../../error";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const orderCalculateTaxesSyncWebhook = new SaleorSyncWebhook<CalculateTaxesPayload>({
  name: "OrderCalculateTaxes",
  apl: saleorApp.apl,
  event: "ORDER_CALCULATE_TAXES",
  query: UntypedCalculateTaxesDocument,
  webhookPath: "/api/webhooks/order-calculate-taxes",
});

export default wrapWithLoggerContext(
  withOtel(
    orderCalculateTaxesSyncWebhook.createHandler(async (req, res, ctx) => {
      const logger = createLogger("orderCalculateTaxesSyncWebhook");
      const { payload } = ctx;
      const webhookResponse = new WebhookResponse(res);

      logger.info("Handler for ORDER_CALCULATE_TAXES webhook called");

      try {
        const useCaseService = new CalculateTaxesUseCase(payload, ctx.authData);

        return await useCaseService.calculateTaxes().match(
          (calculatedTaxes) => {
            return webhookResponse.success(ctx.buildResponse(calculatedTaxes));
          },
          (useCaseError) => {
            logger.debug("Error executing webhook", { error: useCaseError });

            switch (true) {
              case useCaseError instanceof CalculateTaxesUseCaseErrors.AppMisconfiguredError: {
                return res.status(400).send("App is not configured properly");
              }
              case useCaseError instanceof CalculateTaxesUseCaseErrors.WrongChannelError: {
                return res.status(500).send("Webhook executed to the invalid channel");
              }
              case useCaseError instanceof CalculateTaxesUseCaseErrors.UnknownError: {
                Sentry.captureException(useCaseError);

                logger.fatal(`UNHANDLED: ${useCaseError.message}`, {
                  error: useCaseError,
                });

                return res.status(500).send("Webhook execution failed (unhandled)");
              }
            }
          },
        );
      } catch (e) {
        const uncaughtError = BaseError.normalize(e);

        Sentry.captureException(uncaughtError);

        logger.fatal(`UNHANDLED: ${uncaughtError.message}`, {
          error: e,
        });

        return res.status(500).send("Error calculating taxes");
      }
    }),
    "/api/order-calculate-taxes",
  ),
  loggerContext,
);
