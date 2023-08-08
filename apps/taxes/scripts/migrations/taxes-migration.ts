/* eslint-disable multiline-comment-style */
import { orderConfirmedAsyncWebhook } from "../../src/pages/api/webhooks/order-confirmed";
import { AppWebhookMigrator } from "./app-webhook-migrator";

/*
 * Previously, the Avatax transactions were created on ORDER_CREATED webhook and commited on ORDER_FULFILLED webhook.
 * Now, the Avatax transactions are created and commited (if `isAutocommit`: true) on ORDER_CONFIRMED webhook.
 * If transaction was created on ORDER_CREATED and we remove the ORDER_FULFILLED webhook, the transaction can never be commited.
 * Therefore, the `ORDER_FULFILLED` can't be removed.
 */

/**
 * Contains the migration logic for the Taxes App. It is expected to only write, not delete. The cleanup will be done some time later.
 * @param webhookMigrator - The AppWebhookMigrator instance.
 */
export async function migrateTaxes(webhookMigrator: AppWebhookMigrator) {
  // Creates ORDER_CONFIRMED webhook for each Taxes App.
  await webhookMigrator.registerWebhookIfItDoesntExist(orderConfirmedAsyncWebhook);

  // If something went wrong, we can roll back the migration by uncommenting this line:
  // await webhookMigrator.DANGEROUS_DELETE_APP_WEBHOOK_BY_NAME(orderConfirmedAsyncWebhook.name);
  // It will delete the ORDER_CONFIRMED webhooks created above.

  // If everything went well, we can delete the ORDER_CREATED webhook by uncommenting this line:
  // await webhookMigrator.DANGEROUS_DELETE_APP_WEBHOOK_BY_NAME("OrderCreated");
}
