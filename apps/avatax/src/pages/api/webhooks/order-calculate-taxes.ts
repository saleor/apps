import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { UntypedCalculateTaxesDocument } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { getActiveConnectionService } from "../../../modules/taxes/get-active-connection-service";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { withOtel } from "@saleor/apps-otel";
import { createLogger } from "../../../logger";
import { verifyCalculateTaxesPayload } from "../../../modules/webhooks/validate-webhook-payload";
import { CalculateTaxesPayload } from "../../../modules/webhooks/calculate-taxes-payload";

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

export default withOtel(
  orderCalculateTaxesSyncWebhook.createHandler(async (req, res, ctx) => {
    const logger = createLogger("orderCalculateTaxesSyncWebhook");
    const { payload } = ctx;
    const webhookResponse = new WebhookResponse(res);

    logger.info("Handler for ORDER_CALCULATE_TAXES webhook called");

    const payloadVerificationResult = verifyCalculateTaxesPayload(payload);

    if (payloadVerificationResult.isErr()) {
      logger.debug("Failed to calculate taxes, due to incomplete payload", {
        error: payloadVerificationResult.error,
      });

      return res.status(400).send(payloadVerificationResult.error.message);
    }

    try {
      logger.debug("Payload validated successfully");

      const appMetadata = payload.recipient?.privateMetadata ?? [];
      const channelSlug = payload.taxBase.channel.slug;
      const activeConnectionServiceResult = getActiveConnectionService(
        channelSlug,
        appMetadata,
        ctx.authData,
      );

      logger.info("Found active connection service. Calculating taxes...");

      if (activeConnectionServiceResult.isOk()) {
        const calculatedTaxes = await activeConnectionServiceResult.value.calculateTaxes(payload);

        logger.info("Taxes calculated", { calculatedTaxes });

        return webhookResponse.success(ctx.buildResponse(calculatedTaxes));
      } else if (activeConnectionServiceResult.isErr()) {
        // TODO Map errors like in CHECKOUT_CALCULATE_TAXES
        return webhookResponse.error(activeConnectionServiceResult.error);
      }
    } catch (error) {
      return webhookResponse.error(error);
    }
  }),
  "/api/order-calculate-taxes",
);
