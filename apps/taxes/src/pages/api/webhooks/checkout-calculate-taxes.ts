import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { UntypedCalculateTaxesDocument } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createLogger } from "../../../lib/logger";
import { calculateTaxesPayloadSchema, ExpectedWebhookPayload } from "../../../lib/saleor/schema";
import { getAppConfig } from "../../../modules/app-configuration/get-app-config";

import { ActiveTaxProvider } from "../../../modules/taxes/active-tax-provider";

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

  const { providers, channels } = getAppConfig(data);
  logger.debug("Successfully parsed providers & channels from payload");

  try {
    const channelSlug = data.taxBase.channel.slug;
    const channelConfig = channels[channelSlug];

    if (!channelConfig) {
      logger.error(`Channel config not found for channel ${channelSlug}`);
      logger.info("Returning no data");
      return res.send({});
    }

    const providerInstance = providers.find(
      (instance) => instance.id === channelConfig.providerInstanceId
    );

    if (!providerInstance) {
      logger.error(`Channel (${channelSlug}) providerInstanceId does not match any providers`);
      logger.info("Returning no data");
      return res.send({});
    }

    const taxProvider = new ActiveTaxProvider(providerInstance);
    const calculatedTaxes = await taxProvider.calculateTaxes(data.taxBase, channelConfig);

    logger.info({ calculatedTaxes }, "Taxes calculated");
    return res.send(ctx.buildResponse(calculatedTaxes));
  } catch (error) {
    logger.error({ error }, "Error while calculating taxes");
    logger.info("Returning no data");
    return res.send({});
  }
});
