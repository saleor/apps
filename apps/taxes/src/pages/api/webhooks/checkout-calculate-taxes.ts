import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  CalculateTaxesEventFragment,
  UntypedCalculateTaxesDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createLogger } from "../../../lib/logger";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { getActiveConnectionService } from "../../../modules/taxes/get-active-connection-service";
import { TaxIncompleteWebhookPayloadError } from "../../../modules/taxes/tax-error";

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
    throw new TaxIncompleteWebhookPayloadError("No lines found in taxBase");
  }

  if (!payload.taxBase.address) {
    throw new TaxIncompleteWebhookPayloadError("No address found in taxBase");
  }

  return payload;
}

export const checkoutCalculateTaxesSyncWebhook = new SaleorSyncWebhook<CalculateTaxesPayload>({
  name: "CheckoutCalculateTaxes",
  apl: saleorApp.apl,
  event: "CHECKOUT_CALCULATE_TAXES",
  query: UntypedCalculateTaxesDocument,
  webhookPath: "/api/webhooks/checkout-calculate-taxes",
});

export default checkoutCalculateTaxesSyncWebhook.createHandler(async (req, res, ctx) => {
  const logger = createLogger({ name: "checkoutCalculateTaxesSyncWebhook" });
  const { payload } = ctx;
  const webhookResponse = new WebhookResponse(res);

  logger.info("Handler for CHECKOUT_CALCULATE_TAXES webhook called");

  try {
    verifyCalculateTaxesPayload(payload);
    logger.debug("Payload validated Successfully");

    const appMetadata = payload.recipient?.privateMetadata ?? [];
    const channelSlug = payload.taxBase.channel.slug;
    const activeConnectionService = getActiveConnectionService(
      channelSlug,
      appMetadata,
      ctx.authData,
    );

    logger.info("Found active connection service. Calculating taxes...");
    const calculatedTaxes = await activeConnectionService.calculateTaxes(payload);

    logger.info({ calculatedTaxes }, "Taxes calculated");
    return webhookResponse.success(ctx.buildResponse(calculatedTaxes));
  } catch (error) {
    return webhookResponse.error(error);
  }
});
