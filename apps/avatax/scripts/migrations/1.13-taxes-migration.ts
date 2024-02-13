/* eslint-disable multiline-comment-style */
import { AppWebhookMigrator } from "./app-webhook-migrator";

/**
 * Contains the migration logic for the Taxes App. In the 1st step, it is expected to only write, not delete. The cleanup will be done in the 2nd step.
 * @param webhookMigrator - The AppWebhookMigrator instance.
 */
export async function migrateTaxes(webhookMigrator: AppWebhookMigrator) {
  // Migration plan:
  // 1st step
  // 1. Create new ORDER_CONFIRMED webhooks for each Taxes App.
  // await webhookMigrator.registerWebhookIfItDoesntExist(orderConfirmedAsyncWebhook);
  //
  // 2. To confirm if everything is working as expected, we can get all webhooks for apps and check if the ORDER_CONFIRMED webhooks were created.
  // await webhookMigrator.getAppWebhooks();
  //
  // 3. If something went wrong, we can roll back the migration by uncommenting this line:
  // await webhookMigrator.DANGEROUS_DELETE_APP_WEBHOOK_BY_NAME(orderConfirmedAsyncWebhook.name);
  // It will delete the ORDER_CONFIRMED webhooks created above.
  //
  // 2nd step (after two weeks)
  // 1. Comment the 1st step code above.
  // 2. Delete the ORDER_CREATED and ORDER_FULFILLED webhooks by uncommenting this line:
  // await webhookMigrator.DANGEROUS_DELETE_APP_WEBHOOK_BY_NAME("OrderCreated");
  // await webhookMigrator.DANGEROUS_DELETE_APP_WEBHOOK_BY_NAME("OrderFulfilled");
  //
  // Migrations completed ✅. The file remains as an artefact.
}
