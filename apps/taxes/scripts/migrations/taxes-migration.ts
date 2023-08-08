import { orderConfirmedAsyncWebhook } from "../../src/pages/api/webhooks/order-confirmed";
import { AppWebhookMigrator } from "./app-webhook-migrator";

/*
 * Previously, the Avatax transactions were created on ORDER_CREATED webhook and commited on ORDER_FULFILLED webhook.
 * Now, the Avatax transactions are created and commited (if `isAutocommit`: true) on ORDER_CONFIRMED webhook.
 * If transaction was created on ORDER_CREATED and we remove the ORDER_FULFILLED webhook, the transaction can never be commited.
 * Therefore, the `ORDER_FULFILLED` can't be removed.
 */
/*
 * Migration plan:
 * ORDER_CREATED -> ORDER_CONFIRMED. Create ORDER_CONFIRMED webhook if doesn't exists. Delete ORDER_CREATED webhook.
 * ORDER_FULFILLED -> ❌. Delete ORDER_FULFILLED webhook some time.
 */

export async function migrateTaxes(webhookMigrator: AppWebhookMigrator) {
  await webhookMigrator.migrateWebhook("OrderCreated", orderConfirmedAsyncWebhook);
}
