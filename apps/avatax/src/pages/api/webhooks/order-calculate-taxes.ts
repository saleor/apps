import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { UntypedCalculateTaxesDocument } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { withOtel } from "@saleor/apps-otel";
import { createLogger } from "../../../logger";
import * as Sentry from "@sentry/nextjs";
import { CalculateTaxesPayload } from "../../../modules/webhooks/calculate-taxes-payload";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { loggerContext } from "../../../logger-context";
import {
  CalculateTaxesUseCase,
  CalculateTaxesUseCaseErrors,
} from "../../../use-cases/calculate-taxes/calculate-taxes.use-case";
import { BaseError } from "../../../error";
import { ActiveConnectionServiceResolver } from "../../../modules/taxes/get-active-connection-service";

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

const useCaseService = CalculateTaxesUseCase.create();

export default wrapWithLoggerContext(
  withOtel(
    orderCalculateTaxesSyncWebhook.createHandler(async (req, res, ctx) => {
      const logger = createLogger("orderCalculateTaxesSyncWebhook");
      const { payload } = ctx;
      const webhookResponse = new WebhookResponse(res);

      logger.info("Handler for ORDER_CALCULATE_TAXES webhook called");

      try {
        return await useCaseService.calculateTaxes(payload, ctx.authData).match(
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
                const error = CalculateTaxesUseCaseErrors.UnknownError.normalize(useCaseError);

                Sentry.captureException(error);

                logger.fatal(`UNHANDLED: ${error.message}`, {
                  error: error,
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
