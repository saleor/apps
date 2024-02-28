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
import { verifyCalculateTaxesPayload } from "../../../modules/webhooks/validate-webhook-payload";
import { ActiveConnectionServiceResolver } from "../../../modules/taxes/get-active-connection-service";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const checkoutCalculateTaxesSyncWebhook = new SaleorSyncWebhook<CalculateTaxesPayload>({
  name: "CheckoutCalculateTaxes",
  apl: saleorApp.apl,
  event: "CHECKOUT_CALCULATE_TAXES",
  query: UntypedCalculateTaxesDocument,
  webhookPath: "/api/webhooks/checkout-calculate-taxes",
});

const useCaseService = CalculateTaxesUseCase.create({
  avataxResolver: new ActiveConnectionServiceResolver(),
});

/**
 * TODO: Add tests to handler
 */
export default wrapWithLoggerContext(
  withOtel(
    checkoutCalculateTaxesSyncWebhook.createHandler(async (req, res, ctx) => {
      const logger = createLogger("checkoutCalculateTaxesSyncWebhook");
      const { payload } = ctx;
      const webhookResponse = new WebhookResponse(res);

      logger.info("Handler for CHECKOUT_CALCULATE_TAXES webhook called");

      try {
        const payloadVerificationResult = verifyCalculateTaxesPayload(payload);

        if (payloadVerificationResult.isErr()) {
          logger.debug("Failed to calculate taxes, due to incomplete payload", {
            error: payloadVerificationResult.error,
          });

          /**
           * For checkout case, some fields may be missing, so perform additional check before
           */
          return res.status(400).send(payloadVerificationResult.error.message);
        }

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
    "/api/webhooks/checkout-calculate-taxes",
  ),
  loggerContext,
);
