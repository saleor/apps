import { UntypedCalculateTaxesDocument } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createLogger } from "../../../lib/logger";
import { withTaxesWebhook } from "../../../lib/saleor/with-taxes-webhook";
import { ActiveTaxProvider } from "../../../modules/taxes/active-tax-provider";
import { TaxSaleorSyncWebhook } from "../../../modules/taxes/tax-webhook";

export const orderCalculateTaxesSyncWebhook = new TaxSaleorSyncWebhook({
  name: "OrderCalculateTaxes",
  apl: saleorApp.apl,
  syncEvent: "ORDER_CALCULATE_TAXES",
  subscriptionQueryAst: UntypedCalculateTaxesDocument,
  webhookPath: "/api/webhooks/order-calculate-taxes",
});

const handler = withTaxesWebhook(async (payload, config, res) => {
  const logger = createLogger({});
  logger.info("Inside ORDER_CALCULATE_TAXES handler");
  const { provider, channel } = config;
  const taxProvider = new ActiveTaxProvider(provider);
  const calculatedTaxes = await taxProvider.calculate(payload.taxBase, channel);

  logger.info({ calculatedTaxes }, "Taxes calculated");
  return res.status(200).json(calculatedTaxes);
});

export default orderCalculateTaxesSyncWebhook.createHandler(handler);
