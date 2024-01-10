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
      const activeConnectionService = getActiveConnectionService(
        channelSlug,
        appMetadata,
        ctx.authData,
      );

      logger.info("Found active connection service. Calculating taxes...");
      const calculatedTaxes = await activeConnectionService.calculateTaxes(payload);

      logger.info("Taxes calculated", { calculatedTaxes });
      return webhookResponse.success(ctx.buildResponse(calculatedTaxes));
    } catch (error) {
      return webhookResponse.error(error);
    }
  }),
  "/api/order-calculate-taxes",
);
