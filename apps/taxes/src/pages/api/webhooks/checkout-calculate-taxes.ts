import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  CalculateTaxesEventFragment,
  UntypedCalculateTaxesDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createLogger } from "../../../lib/logger";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import { getActiveTaxProvider } from "../../../modules/taxes/active-tax-provider";

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
  const logger = createLogger({ event: ctx.event });
  const { payload } = ctx;
  const webhookResponse = new WebhookResponse(res);

  logger.info({ payload }, "Handler called with payload");

  try {
    verifyCalculateTaxesPayload(payload);
    logger.info("Payload validated succesfully");
  } catch (error) {
    logger.info("Returning no data");
    return webhookResponse.failureNoRetry("Payload is invalid");
  }

  try {
    const appMetadata = payload.recipient?.privateMetadata ?? [];
    const channelSlug = payload.taxBase.channel.slug;
    const activeTaxProvider = getActiveTaxProvider(channelSlug, appMetadata);

    if (!activeTaxProvider.ok) {
      logger.info("Returning no data");
      return webhookResponse.failureNoRetry(activeTaxProvider.error);
    }

    logger.info({ activeTaxProvider }, "Fetched activeTaxProvider");
    const taxProvider = activeTaxProvider.data;
    const calculatedTaxes = await taxProvider.calculateTaxes(payload.taxBase);

    logger.info({ calculatedTaxes }, "Taxes calculated");
    return webhookResponse.success(ctx.buildResponse(calculatedTaxes));
  } catch (error) {
    return webhookResponse.failureRetry("Error while calculating taxes");
  }
});
