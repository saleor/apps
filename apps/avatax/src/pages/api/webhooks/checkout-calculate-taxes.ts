import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { UntypedCalculateTaxesDocument } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { getActiveConnectionService } from "../../../modules/taxes/get-active-connection-service";
import { withOtel } from "@saleor/apps-otel";
import { createLogger } from "../../../logger";
import * as Sentry from "@sentry/nextjs";
import { Simulate } from "react-dom/test-utils";
import { NextApiRequest, NextApiResponse } from "next";
import { verifyCalculateTaxesPayload } from "../../../modules/webhooks/validate-webhook-payload";
import { CalculateTaxesPayload } from "../../../modules/webhooks/calculate-taxes-payload";
import error = Simulate.error;

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
 * Translate internal errors to responses back to Saleor
 *
 * TODO: Maybe we can find more elegant and less verbose way to map Modern Errors to functions?
 * Instances don't translate well with their constructors
 */
const webhookErrorToResponseMapper = (req: NextApiRequest, res: NextApiResponse) => {
  return new Map([
    [
      "BrokenConfigurationError",
      () =>
        res
          .status(400)
          .send("App is not configured properly. Please verify configuration or reinstall the app"),
    ],
    [
      "MissingMetadataError",
      () => res.status(400).send("App is not configured properly. Configure the app first"),
    ],
    [
      "MissingChannelSlugError",
      () => res.status(500).send("Webhook didn't contain channel slug. This should not happen."),
    ],
    [
      "WrongChannelError",
      () =>
        res
          .status(500)
          .send(
            "Webhook was executed for channel that it was not configured with. This should not happen.",
          ),
    ],
    [
      "ProviderNotAssignedToChannelError",
      () =>
        res
          .status(400)
          .send("App is not configured properly. Please verify configuration or reinstall the app"),
    ],
  ]);
};

/**
 * TODO: Add tests to handler
 */
export default withOtel(
  checkoutCalculateTaxesSyncWebhook.createHandler(async (req, res, ctx) => {
    const logger = createLogger("checkoutCalculateTaxesSyncWebhook");
    const { payload } = ctx;
    const webhookResponse = new WebhookResponse(res);

    logger.info("Handler for CHECKOUT_CALCULATE_TAXES webhook called");

    const payloadVerificationResult = verifyCalculateTaxesPayload(payload);

    if (payloadVerificationResult.isErr()) {
      logger.debug("Failed to calculate taxes, due to incomplete payload", {
        error: payloadVerificationResult.error,
      });

      return res.status(400).send(payloadVerificationResult.error.message);
    }

    try {
      const appMetadata = payload.recipient?.privateMetadata ?? [];
      const channelSlug = payload.taxBase.channel.slug;
      const activeConnectionServiceResult = getActiveConnectionService(
        channelSlug,
        appMetadata,
        ctx.authData,
      );

      if (activeConnectionServiceResult.isErr()) {
        const err = activeConnectionServiceResult.error;

        logger.debug(`Error in taxes calculation occured: ${err.name} ${err.message}`, {
          error: err,
        });

        const executeErrorStrategy = webhookErrorToResponseMapper(req, res).get(err.name);

        if (executeErrorStrategy) {
          return executeErrorStrategy();
        } else {
          Sentry.captureException(err);
          logger.fatal(`UNHANDLED: ${error.name}`, {
            error: error,
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
);
