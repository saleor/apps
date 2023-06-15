/* eslint-disable turbo/no-undeclared-env-vars */

import * as dotenv from "dotenv";
import { fetchCloudAplEnvs, getMetadataManagerForEnv, verifyRequiredEnvs } from "./migration-utils";
import { TaxProvidersV1toV2MigrationManager } from "./tax-providers-migration-v1-to-v2";
import { TaxChannelsV1toV2MigrationManager } from "./tax-channels-migration-v1-to-v2";

dotenv.config();

const runMigration = async () => {
  console.log("Starting running migration");

  verifyRequiredEnvs();

  console.log("Envs verified, fetching envs");
  const allEnvs = await fetchCloudAplEnvs().catch((r) => {
    console.error(r);

    process.exit(1);
  });

  const report = {
    taxProviders: [] as string[],
    taxChannels: [] as string[],
    none: [] as string[],
  };

  for (const env of allEnvs) {
    let isTaxProvidersMigrated = false;
    let isTaxChannelsMigrated = false;

    console.log("Working on env: ", env.saleorApiUrl);

    const metadataManager = getMetadataManagerForEnv(env.saleorApiUrl, env.token, env.appId);

    const taxProvidersMigrationManager = new TaxProvidersV1toV2MigrationManager(
      metadataManager,
      env.saleorApiUrl,
      { mode: "migrate" }
    );

    const taxProvidersMigratedConfig = await taxProvidersMigrationManager.migrateIfNeeded();

    if (taxProvidersMigratedConfig) {
      console.log("Config migrated", taxProvidersMigratedConfig);
      isTaxProvidersMigrated = true;
    }

    const taxChannelsMigrationManager = new TaxChannelsV1toV2MigrationManager(
      metadataManager,
      env.saleorApiUrl,
      { mode: "migrate" }
    );

    const taxChannelsMigratedConfig = await taxChannelsMigrationManager.migrateIfNeeded();

    if (taxChannelsMigratedConfig) {
      console.log("Config migrated", taxChannelsMigratedConfig);
      isTaxChannelsMigrated = true;
    }

    if (isTaxProvidersMigrated) {
      report.taxProviders.push(env.saleorApiUrl);
    }

    if (isTaxChannelsMigrated) {
      report.taxChannels.push(env.saleorApiUrl);
    }

    if (!isTaxProvidersMigrated && !isTaxChannelsMigrated) {
      report.none.push(env.saleorApiUrl);
    }
  }

  console.log("Report", report);
};

runMigration();
