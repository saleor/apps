import ora from "ora";
import { getAccessTokenMutation } from "../saleor-api/operations/get-access-token-mutation";
import { getAppsListQuery } from "../saleor-api/operations/get-apps-list-query";
import { select } from "@inquirer/prompts";
import { getAppWebhooksQuery } from "../saleor-api/operations/get-app-webhooks-query";
import { removeWebhookMutation } from "../saleor-api/operations/remove-webhook-mutation";

interface DumpMetadataCommandArgs {
  instanceUrl: string;
  userEmail: string;
  userPassword: string;
}

export const webhooksCommand = async ({
  instanceUrl,
  userEmail,
  userPassword,
}: DumpMetadataCommandArgs) => {
  const loginSpinner = ora("Logging into Saleor instance").start();

  const token = await getAccessTokenMutation({
    email: userEmail,
    password: userPassword,
    saleorApiUrl: instanceUrl,
  });

  loginSpinner.succeed();

  const appListSpinner = ora("Fetching installed apps").start();

  const installedApps = await getAppsListQuery({
    saleorApiUrl: instanceUrl,
    token,
  });

  appListSpinner.succeed();

  if (!installedApps.length) {
    console.log("No apps installed");
    return;
  }

  const appId = await select({
    message: "Select app",
    choices: installedApps.map((app) => ({
      name: app.name ? `${app.name} (${app.id})` : app.id,
      value: app.id,
    })),
  });

  const webhooksData = await getAppWebhooksQuery({
    appId,
    saleorApiUrl: instanceUrl,
    token,
  });

  if (!webhooksData.length) {
    console.log("Application has no webhooks configured");
    return;
  }

  const webhook = await select({
    message: "Select webhook to investigate",
    choices: webhooksData.map((webhook) => ({
      name: `${webhook.name} (${[...webhook.syncEvents, ...webhook.asyncEvents]
        .map((e) => e.name)
        .join(", ")})`,
      value: webhook,
      description: `
Target url: ${webhook.targetUrl}
Active: ${webhook.isActive}
Captured event deliveries count: ${webhook.eventDeliveries?.edges.length}
      `,
    })),
  });

  const operation = await select({
    message: "Operation",
    choices: [
      {
        name: "List event deliveries",
        value: "list",
      },
      {
        name: "Remove webhook",
        value: "remove",
      },
    ],
  });

  if (operation === "list") {
    console.log("Number of entries: ", webhook.eventDeliveries?.edges.length);
    for (const deliveryEdge of webhook.eventDeliveries?.edges ?? []) {
      const delivery = deliveryEdge.node;

      console.log(`
Event type: ${delivery.eventType}
Created at: ${delivery.createdAt}
Status: ${delivery.status}`);
      const attempts = delivery.attempts?.edges ?? [];
      const lastAttempt = attempts[attempts.length - 1]?.node;

      if (lastAttempt) {
        console.log(`
Date of the last attempt: ${lastAttempt.createdAt}
Status: ${lastAttempt.status}`);
      }
    }
  } else if (operation === "remove") {
    const removeSpinner = ora("Removing webhook...").start();

    await removeWebhookMutation({
      saleorApiUrl: instanceUrl,
      token,
      webhookId: webhook.id,
    });

    removeSpinner.succeed();
  }
};
