import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  CalculateTaxesEventFragment,
  UntypedCalculateTaxesDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { getActiveConnectionService } from "../../../modules/taxes/get-active-connection-service";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { TaxIncompleteWebhookPayloadError } from "../../../modules/taxes/tax-error";
import { withOtel } from "@saleor/apps-otel";
import { createLogger } from "../../../logger";
import { calculateTaxesErrorsMapper } from "../../../modules/webhooks/calculate-taxes-errors-mapper";
import * as Sentry from "@sentry/nextjs";

export const config = {
  api: {
    bodyParser: false,
  },
};

type CalculateTaxesPayload = Extract<CalculateTaxesEventFragment, { __typename: "CalculateTaxes" }>;

function verifyCalculateTaxesPayload(payload: CalculateTaxesPayload) {
  if (!payload.taxBase.lines.length) {
    throw new TaxIncompleteWebhookPayloadError("No lines found in taxBase");
  }

  if (!payload.taxBase.address) {
    throw new TaxIncompleteWebhookPayloadError("No address found in taxBase");
  }

  return payload;
}

export const orderCalculateTaxesSyncWebhook = new SaleorSyncWebhook<CalculateTaxesPayload>({
  name: "OrderCalculateTaxes",
  apl: saleorApp.apl,
  event: "ORDER_CALCULATE_TAXES",
  query: UntypedCalculateTaxesDocument,
  webhookPath: "/api/webhooks/order-calculate-taxes",
});

export default withOtel(
  // TODO Test handler, including errors
  orderCalculateTaxesSyncWebhook.createHandler(async (req, res, ctx) => {
    const logger = createLogger("orderCalculateTaxesSyncWebhook");
    const { payload } = ctx;
    const webhookResponse = new WebhookResponse(res);

    logger.info("Handler for ORDER_CALCULATE_TAXES webhook called");

    try {
      verifyCalculateTaxesPayload(payload);
      logger.debug("Payload validated successfully");

      const appMetadata = payload.recipient?.privateMetadata ?? [];
      const channelSlug = payload.taxBase.channel.slug;
      const activeConnectionServiceResult = getActiveConnectionService(
        channelSlug,
        appMetadata,
        ctx.authData,
      );

      logger.info("Found active connection service. Calculating taxes...");

      return activeConnectionServiceResult
        .asyncMap(async (value) => {
          const calculatedTaxes = await value.calculateTaxes(payload);

          return calculatedTaxes.map((value) => {
            logger.info("Taxes calculated", { calculatedTaxes });

            return webhookResponse.success(ctx.buildResponse(value));
          });
        })
        .mapErr((err) => {
          const executeErrorStrategy = calculateTaxesErrorsMapper(req, res).get(err.name);

          if (executeErrorStrategy) {
            return executeErrorStrategy();
          } else {
            Sentry.captureException(err);

            logger.fatal(`UNHANDLED: ${err.name}`, {
              error: err,
            });

            return res.status(500).send("Error calculating taxes");
          }
        });
    } catch (error) {
      // Try-catch just to be sure nothing leaks
      Sentry.captureException(error);

      return webhookResponse.error(error);
    }
  }),
  "/api/order-calculate-taxes",
);
