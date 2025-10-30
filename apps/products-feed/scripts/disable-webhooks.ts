/* eslint-disable no-console */
import { parseArgs } from "node:util";

import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";

import { DisableWebhookDocument, FetchAppWebhooksDocument } from "../generated/graphql";
import { saleorApp } from "../src/saleor-app";

const {
  values: { "saleor-api-url": saleorApiUrl, "dry-run": dryRun },
} = parseArgs({
  args: process.argv.slice(2),
  options: {
    "saleor-api-url": {
      type: "string",
      short: "u",
      required: true,
    },
    "dry-run": {
      type: "boolean",
      short: "d",
      default: false,
    },
  },
});

if (!saleorApiUrl) {
  console.error("Error: Saleor API URL is required");
  process.exit(1);
}

console.log(`\n🔍 Looking up auth data for: ${saleorApiUrl}`);

if (dryRun) {
  console.log("🏃 DRY RUN MODE - No changes will be applied\n");
}

// Get auth data from DynamoDB APL
let authData;

try {
  authData = await saleorApp.apl.get(saleorApiUrl);
} catch (error) {
  console.error(`❌ Failed to fetch auth data from APL for ${saleorApiUrl}`);
  console.error(error);
  process.exit(1);
}

if (!authData) {
  console.error(`❌ No auth data found for ${saleorApiUrl}`);
  process.exit(1);
}

console.log(`✅ Found auth data for app ID: ${authData.appId}\n`);

// Create GraphQL client
const client = createGraphQLClient({
  saleorApiUrl: authData.saleorApiUrl,
  token: authData.token,
});

// Fetch app webhooks
console.log("📡 Fetching app webhooks...");
const { data, error } = await client.query(FetchAppWebhooksDocument, {}).toPromise();

if (error || !data?.app) {
  console.error("❌ Failed to fetch app webhooks");
  console.error(error);
  process.exit(1);
}

const webhooks = data.app.webhooks || [];

if (webhooks.length === 0) {
  console.log("ℹ️  No webhooks found for this app");
  process.exit(0);
}

console.log(`\n📋 Found ${webhooks.length} webhook(s):\n`);

webhooks.forEach((webhook) => {
  const status = webhook.isActive ? "🟢 Active" : "⚫ Inactive";
  const events = webhook.asyncEvents.map((e) => e.eventType).join(", ");

  console.log(`  ${status} ${webhook.name || webhook.id}`);
  console.log(`     ID: ${webhook.id}`);
  console.log(`     URL: ${webhook.targetUrl}`);
  console.log(`     Events: ${events || "None"}`);
  console.log();
});

// Filter active webhooks
const activeWebhooks = webhooks.filter((w) => w.isActive);

if (activeWebhooks.length === 0) {
  console.log("✅ All webhooks are already disabled");
  process.exit(0);
}

console.log(
  `\n${dryRun ? "Would disable" : "Disabling"} ${activeWebhooks.length} active webhook(s)...\n`,
);

// Disable webhooks
for (const webhook of activeWebhooks) {
  if (dryRun) {
    console.log(`  [DRY RUN] Would disable: ${webhook.name || webhook.id}`);
  } else {
    const { data: disableData, error: disableError } = await client
      .mutation(DisableWebhookDocument, { id: webhook.id })
      .toPromise();

    if (disableError || disableData?.webhookUpdate?.errors.length) {
      console.error(`  ❌ Failed to disable: ${webhook.name || webhook.id}`);
      console.error(disableError || disableData?.webhookUpdate?.errors);
    } else {
      console.log(`  ✅ Disabled: ${webhook.name || webhook.id}`);
    }
  }
}

console.log(`\n${dryRun ? "🏃 Dry run complete" : "✅ All webhooks disabled"}`);
