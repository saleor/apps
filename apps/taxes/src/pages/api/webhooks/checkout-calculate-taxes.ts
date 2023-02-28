import { UntypedCalculateTaxesDocument } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createLogger } from "../../../lib/logger";
import { withTaxesWebhook } from "../../../lib/saleor/with-taxes-webhook";
import { ActiveTaxProvider } from "../../../modules/taxes/active-tax-provider";
import { TaxSaleorSyncWebhook } from "../../../modules/taxes/tax-webhook";

export const checkoutCalculateTaxesSyncWebhook = new TaxSaleorSyncWebhook({
  name: "CheckoutCalculateTaxes",
  apl: saleorApp.apl,
  syncEvent: "CHECKOUT_CALCULATE_TAXES",
  subscriptionQueryAst: UntypedCalculateTaxesDocument,
  webhookPath: "/api/webhooks/checkout-calculate-taxes",
});

const handler = withTaxesWebhook(async (payload, config, res) => {
  const logger = createLogger({});
  logger.info("Inside CHECKOUT_CALCULATE_TAXES handler");
  const { provider, channel } = config;
  const taxProvider = new ActiveTaxProvider(provider);
  const calculatedTaxes = await taxProvider.calculate(payload.taxBase, channel);

  logger.info({ calculatedTaxes }, "Taxes calculated");
  return res.status(200).json(calculatedTaxes);
});

export default checkoutCalculateTaxesSyncWebhook.createHandler(handler);
