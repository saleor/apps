import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  CalculateTaxesEventFragment,
  UntypedCalculateTaxesDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createLogger } from "../../../lib/logger";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { getActiveConnection } from "../../../modules/taxes/active-connection";

export const config = {
  api: {
    bodyParser: false,
  },
};

type CalculateTaxesPayload = Extract<CalculateTaxesEventFragment, { __typename: "CalculateTaxes" }>;

function verifyCalculateTaxesPayload(payload: CalculateTaxesPayload) {
  if (!payload.taxBase.lines) {
    throw new Error("No lines found in taxBase");
  }

  if (!payload.taxBase.address) {
    throw new Error("No address found in taxBase");
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
  const logger = createLogger({ location: "checkoutCalculateTaxesSyncWebhook" });
  const { payload } = ctx;
  const webhookResponse = new WebhookResponse(res);

  logger.info("Handler for CHECKOUT_CALCULATE_TAXES webhook called");

  try {
    verifyCalculateTaxesPayload(payload);
    logger.debug("Payload validated succesfully");
  } catch (error) {
    logger.debug("Payload validation failed");
    return webhookResponse.error(error);
  }

  try {
    const appMetadata = payload.recipient?.privateMetadata ?? [];
    const channelSlug = payload.taxBase.channel.slug;
    const taxProvider = getActiveConnection(channelSlug, appMetadata);

    logger.info("Will calculate taxes using the tax provider:");
    const calculatedTaxes = await taxProvider.calculateTaxes(payload.taxBase);

    logger.info("Taxes calculated");
    return webhookResponse.success(ctx.buildResponse(calculatedTaxes));
  } catch (error) {
    return webhookResponse.error(error);
  }
});
