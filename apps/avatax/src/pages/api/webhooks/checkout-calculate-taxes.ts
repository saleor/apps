import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { UntypedCalculateTaxesDocument } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { getActiveConnectionService } from "../../../modules/taxes/get-active-connection-service";
import { withOtel } from "@saleor/apps-otel";
import { createLogger } from "../../../logger";
import * as Sentry from "@sentry/nextjs";
import { calculateTaxesErrorsStrategy } from "../../../modules/webhooks/calculate-taxes-errors-strategy";

import { verifyCalculateTaxesPayload } from "../../../modules/webhooks/validate-webhook-payload";
import { CalculateTaxesPayload } from "../../../modules/webhooks/calculate-taxes-payload";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { loggerContext } from "../../../logger-context";

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

          return res.status(400).send(payloadVerificationResult.error.message);
        }

        const appMetadata = payload.recipient?.privateMetadata ?? [];
        const channelSlug = payload.taxBase.channel.slug;
        const activeConnectionServiceResult = getActiveConnectionService(
          channelSlug,
          appMetadata,
          ctx.authData,
        );

        if (activeConnectionServiceResult.isErr()) {
          const err = activeConnectionServiceResult.error;

          logger.debug(`Error in taxes calculation occurred: ${err.name} ${err.message}`, {
            error: err,
          });

          const executeErrorStrategy = calculateTaxesErrorsStrategy(req, res).get(err.name);

          if (executeErrorStrategy) {
            return executeErrorStrategy();
          } else {
            Sentry.captureException(err);

            logger.fatal(`UNHANDLED: ${err.name}`, {
              error: err,
            });

            return res.status(500).send("Error calculating taxes");
          }
        } else {
          logger.debug("Found active connection service. Calculating taxes...");
          // TODO: Improve errors handling like above
          const calculatedTaxes = await activeConnectionServiceResult.value.calculateTaxes(payload);

          logger.debug("Taxes calculated", { calculatedTaxes });
          return webhookResponse.success(ctx.buildResponse(calculatedTaxes));
        }
      } catch (error) {
        Sentry.captureException(error);

        return webhookResponse.error(error);
      }
    }),
    "/api/webhooks/checkout-calculate-taxes",
  ),
  loggerContext,
);
