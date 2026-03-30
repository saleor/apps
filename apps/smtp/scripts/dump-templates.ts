/* eslint-disable no-console */
/**
 * Dumps all configured SMTP templates from every installed app instance.
 * Outputs one JSON line per event template to stdout (JSONL format).
 *
 * Run: pnpm dump-templates > templates.jsonl
 *
 * Requires the same env as the app (APL credentials, SECRET_KEY, etc.)
 *
 * Line format:
 *   {"saleorApiUrl":"...","appId":"...","configId":"...","configName":"...","eventType":"...","template":"...","subject":"..."}
 */
import { type AuthData } from "@saleor/app-sdk/APL";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";

import { createSettingsManager } from "../src/lib/metadata-manager";
import { SmtpMetadataManager } from "../src/modules/smtp/configuration/smtp-metadata-manager";
import { type SmtpConfig } from "../src/modules/smtp/configuration/smtp-config-schema";

async function fetchConfig(
  authData: AuthData,
): Promise<{ config: SmtpConfig | null; error?: string }> {
  const client = createGraphQLClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  const settingsManager = createSettingsManager(client, authData.appId);
  const metadataManager = new SmtpMetadataManager(settingsManager, authData.saleorApiUrl);
  const result = await metadataManager.getConfig();

  if (result.isErr()) {
    return { config: null, error: result.error.message };
  }

  return { config: result.value ?? null };
}

async function main() {
  const { apl } = await import("../src/saleor-app");

  const allAuthData = await apl.getAll();

  if (!allAuthData.length) {
    console.error("No installed instances found.");
    return;
  }

  console.error(`Found ${allAuthData.length} instance(s), fetching configs...`);

  const CONCURRENCY = 5;

  for (let i = 0; i < allAuthData.length; i += CONCURRENCY) {
    const batch = allAuthData.slice(i, i + CONCURRENCY);

    const results = await Promise.all(
      batch.map(async (authData) => {
        const { config, error } = await fetchConfig(authData);

        return { authData, config, error };
      }),
    );

    for (const { authData, config, error } of results) {
      if (error || !config) {
        console.error(`ERROR ${authData.saleorApiUrl}: ${error ?? "no config"}`);
        continue;
      }

      for (const configuration of config.configurations) {
        for (const event of configuration.events) {
          const line = JSON.stringify({
            saleorApiUrl: authData.saleorApiUrl,
            appId: authData.appId,
            configId: configuration.id,
            configName: configuration.name,
            eventType: event.eventType,
            template: event.template,
            subject: event.subject,
          });

          console.log(line);
        }
      }
    }
  }

  console.error("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
