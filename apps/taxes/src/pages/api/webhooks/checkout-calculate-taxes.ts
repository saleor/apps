import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { UntypedCalculateTaxesDocument } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createLogger } from "../../../lib/logger";
import { calculateTaxesPayloadSchema, ExpectedWebhookPayload } from "../../../lib/saleor/schema";
import { getActiveTaxProvider } from "../../../modules/taxes/active-tax-provider";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const checkoutCalculateTaxesSyncWebhook = new SaleorSyncWebhook<ExpectedWebhookPayload>({
  name: "CheckoutCalculateTaxes",
  apl: saleorApp.apl,
  event: "CHECKOUT_CALCULATE_TAXES",
  query: UntypedCalculateTaxesDocument,
  webhookPath: "/api/webhooks/checkout-calculate-taxes",
});

export default checkoutCalculateTaxesSyncWebhook.createHandler(async (req, res, ctx) => {
  const logger = createLogger({ event: ctx.event });
  const { payload } = ctx;
  logger.info({ payload }, "Handler called with payload");

  const validation = calculateTaxesPayloadSchema.safeParse(payload);

  if (!validation.success) {
    logger.error({ error: validation.error.format() }, "Payload is invalid");
    logger.info("Returning no data");
    return res.send({});
  }

  const { data } = validation;
  logger.info("Payload validated succesfully");

  try {
    const appMetadata = data.recipient?.privateMetadata ?? [];
    const channelSlug = data.taxBase.channel.slug;
    const activeTaxProvider = getActiveTaxProvider(channelSlug, appMetadata);

    if (!activeTaxProvider.ok) {
      logger.error({ error: activeTaxProvider.error }, "getActiveTaxProvider error");
      logger.info("Returning no data");
      return res.status(200).json({ success: false });
    }

    logger.info({ activeTaxProvider }, "Fetched activeTaxProvider");
    const taxProvider = activeTaxProvider.data;
    const calculatedTaxes = await taxProvider.calculateTaxes(data.taxBase);

    logger.info({ calculatedTaxes }, "Taxes calculated");
    return res.send(ctx.buildResponse(calculatedTaxes));
  } catch (error) {
    logger.error({ error }, "Error while calculating taxes");
    return res.status(400).json({ success: false, message: "Error while calculating taxes" });
  }
});
