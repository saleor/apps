import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  CalculateTaxesEventFragment,
  UntypedCalculateTaxesDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createLogger } from "../../../lib/logger";
import { getActiveConnection } from "../../../modules/taxes/active-connection";
import { WebhookResponse } from "../../../modules/app/webhook-response";

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

export const orderCalculateTaxesSyncWebhook = new SaleorSyncWebhook<CalculateTaxesPayload>({
  name: "OrderCalculateTaxes",
  apl: saleorApp.apl,
  event: "ORDER_CALCULATE_TAXES",
  query: UntypedCalculateTaxesDocument,
  webhookPath: "/api/webhooks/order-calculate-taxes",
});

export default orderCalculateTaxesSyncWebhook.createHandler(async (req, res, ctx) => {
  const logger = createLogger({ location: "orderCalculateTaxesSyncWebhook" });
  const { payload } = ctx;
  const webhookResponse = new WebhookResponse(res);

  logger.info("Handler for ORDER_CALCULATE_TAXES webhook called");

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

    logger.info("Will calculate taxes");
    const calculatedTaxes = await taxProvider.calculateTaxes(payload.taxBase);

    logger.info("Taxes calculated");
    return webhookResponse.success(ctx.buildResponse(calculatedTaxes));
  } catch (error) {
    return webhookResponse.error(error);
  }
});
