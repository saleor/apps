import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { UntypedCalculateTaxesDocument } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createClient } from "../../../lib/graphql";
import { createLogger } from "../../../lib/logger";
import { calculateTaxesPayloadSchema, ExpectedWebhookPayload } from "../../../lib/saleor/schema";
import { GetChannelsConfigurationService } from "../../../modules/channels-configuration/get-channels-configuration.service";
import { GetProvidersConfigurationService } from "../../../modules/providers-configuration/get-providers-configuration.service";
import { ActiveTaxProvider } from "../../../modules/taxes/active-tax-provider";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const orderCalculateTaxesSyncWebhook = new SaleorSyncWebhook<ExpectedWebhookPayload>({
  name: "OrderCalculateTaxes",
  apl: saleorApp.apl,
  event: "ORDER_CALCULATE_TAXES",
  query: UntypedCalculateTaxesDocument,
  webhookPath: "/api/webhooks/order-calculate-taxes",
});

export default orderCalculateTaxesSyncWebhook.createHandler(async (req, res, ctx) => {
  const logger = createLogger({ event: ctx.event });
  const { authData, payload } = ctx;
  logger.info({ payload }, "Handler called with payload");

  const validation = calculateTaxesPayloadSchema.safeParse(payload);

  if (!validation.success) {
    logger.error({ error: validation.error.message }, "Payload is invalid");
    logger.info("Returning no data");
    return res.status(200).json({});
  }

  const { data } = validation;
  logger.info({ data }, "Payload is valid.");

  try {
    const client = createClient(authData.saleorApiUrl, async () =>
      Promise.resolve({ token: authData.token })
    );

    const providersConfig = await new GetProvidersConfigurationService({
      saleorApiUrl: authData.saleorApiUrl,
      apiClient: client,
    }).getConfiguration();

    const channelsConfig = await new GetChannelsConfigurationService({
      saleorApiUrl: authData.saleorApiUrl,
      apiClient: client,
    }).getConfiguration();

    logger.info({ providersConfig }, "Providers configuration returned");

    const channelSlug = payload.taxBase.channel.slug;
    const channelConfig = channelsConfig[channelSlug];

    if (!channelConfig) {
      logger.error(`Channel config not found for channel ${channelSlug}`);
      logger.info("Returning no data");
      return res.send({});
    }

    const providerInstance = providersConfig.find(
      (instance) => instance.id === channelConfig.providerInstanceId
    );

    if (!providerInstance) {
      logger.error(`Channel (${channelSlug}) providerInstanceId does not match any providers`);
      logger.info("Returning no data");
      return res.send({});
    }

    const taxProvider = new ActiveTaxProvider(providerInstance);
    const calculatedTaxes = await taxProvider.calculate(data.taxBase, channelConfig);

    logger.info({ calculatedTaxes }, "Taxes calculated");
    return res.send(ctx.buildResponse(calculatedTaxes));
  } catch (error) {
    logger.error({ error }, "Error while calculating taxes");
    logger.info("Returning no data");
    return res.send({});
  }
});
