import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  CalculateTaxesEventFragment,
  UntypedCalculateTaxesDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { getActiveConnectionService } from "../../../modules/taxes/get-active-connection-service";
import { TaxIncompleteWebhookPayloadError } from "../../../modules/taxes/tax-error";
import { withOtel } from "@saleor/apps-otel";
import { createLogger, loggerContext } from "../../../logger";
import { err, ok } from "neverthrow";
import * as Sentry from "@sentry/nextjs";
import { calculateTaxesErrorsStrategy } from "../../../modules/webhooks/calculate-taxes-errors-strategy";
import { wrapWithLoggerContext } from "@saleor/apps-logger";

export const config = {
  api: {
    bodyParser: false,
  },
};

export type CalculateTaxesPayload = Extract<
  CalculateTaxesEventFragment,
  { __typename: "CalculateTaxes" }
>;

function verifyCalculateTaxesPayload(payload: CalculateTaxesPayload) {
  if (!payload.taxBase.lines.length) {
    return err(new TaxIncompleteWebhookPayloadError("No lines found in taxBase"));
  }

  if (!payload.taxBase.address) {
    return err(new TaxIncompleteWebhookPayloadError("No address found in taxBase"));
  }

  return ok(payload);
}

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

        payloadVerificationResult.match(
          (payload) => {
            logger.debug("Payload validated Successfully");
          },
          (error) => {
            logger.error(`[${error.name}] ${error.message}`);
            Sentry.captureException("Invalid payload from Saleor was sent to Avatax app");
          },
        );

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
        return webhookResponse.error(error);
      }
    }),
    "/api/webhooks/checkout-calculate-taxes",
  ),
  loggerContext,
);
