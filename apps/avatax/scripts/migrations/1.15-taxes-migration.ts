/* eslint-disable multiline-comment-style */
import { checkoutCalculateTaxesSyncWebhook } from "../../src/pages/api/webhooks/checkout-calculate-taxes";
import { orderCalculateTaxesSyncWebhook } from "../../src/pages/api/webhooks/order-calculate-taxes";
import { AppWebhookMigrator } from "./app-webhook-migrator";

/**
 * Contains the migration logic for the Taxes App. In the 1st step, it is expected to only write, not delete. The cleanup will be done in the 2nd step.
 * @param webhookMigrator - The AppWebhookMigrator instance.
 */
export async function migrateTaxes(webhookMigrator: AppWebhookMigrator) {
  // Migration plan:
  //  1. Update subscriptionQuery of all calculateTaxes webhooks
  webhookMigrator.updateWebhookQueryByHandler(orderCalculateTaxesSyncWebhook);
  webhookMigrator.updateWebhookQueryByHandler(checkoutCalculateTaxesSyncWebhook);
}
