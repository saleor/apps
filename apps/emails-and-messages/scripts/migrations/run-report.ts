/* eslint-disable turbo/no-undeclared-env-vars */

import * as dotenv from "dotenv";
import { fetchCloudAplEnvs, getMetadataManagerForEnv, verifyRequiredEnvs } from "./migration-utils";

import { AppConfigPrivateMetadataManager } from "../../src/modules/app-configuration/app-config-metadata-manager";
import { SendgridPrivateMetadataManagerV1 } from "../../src/modules/sendgrid/configuration/sendgrid-metadata-manager-v1";
import { MjmlPrivateMetadataManager } from "../../src/modules/smtp/configuration/mjml-metadata-manager";
import { smtpTransformV1toV2 } from "../../src/modules/smtp/configuration/migrations/smtp-transform-v1-to-v2";
import { sendgridTransformV1toV2 } from "../../src/modules/sendgrid/configuration/migrations/sendgrid-transform-v1-to-v2";

dotenv.config();

const runReport = async () => {
  console.log("Starting running report");

  verifyRequiredEnvs();

  console.log("Envs verified, fetching envs");
  const allEnvs = await fetchCloudAplEnvs().catch((r) => {
    console.error(r);

    process.exit(1);
  });

  const report = {
    smtp: [] as string[],
    sendgrid: [] as string[],
    none: [] as string[],
  };

  for (const env of allEnvs) {
    console.log("Working on env: ", env.saleorApiUrl);
    let isSmtpMigrated = false;
    let isSendgridMigrated = false;

    const metadataManager = getMetadataManagerForEnv(env.saleorApiUrl, env.token, env.appId);

    const sendgridMetadataManagerV1 = new SendgridPrivateMetadataManagerV1(
      metadataManager,
      env.saleorApiUrl
    );

    const appMetadataManager = new AppConfigPrivateMetadataManager(
      metadataManager,
      env.saleorApiUrl
    );

    const appConfiguration = await appMetadataManager.getConfig();

    const sendgridConfigurationV1 = await sendgridMetadataManagerV1.getConfig();

    if (sendgridConfigurationV1) {
      console.log("Found old sendgrid config, migrating");
      isSendgridMigrated = true;
      const v2 = sendgridTransformV1toV2({
        configV1: sendgridConfigurationV1,
        appConfigV1: appConfiguration,
      });

      console.log("Old config", sendgridConfigurationV1);
      console.log("New config", v2);
    }

    const mjmlMetadataManagerV1 = new MjmlPrivateMetadataManager(metadataManager, env.saleorApiUrl);

    const mjmlConfiguration = await mjmlMetadataManagerV1.getConfig();

    if (mjmlConfiguration) {
      console.log("Found old mjml config, migrating");
      isSmtpMigrated = true;
      const v2 = smtpTransformV1toV2({
        configV1: mjmlConfiguration,
        appConfigV1: appConfiguration,
      });

      console.log("Old config", mjmlConfiguration);
      console.log("New config", v2);
    }

    if (isSendgridMigrated) {
      report.sendgrid.push(env.saleorApiUrl);
    }

    if (isSmtpMigrated) {
      report.smtp.push(env.saleorApiUrl);
    }

    if (!isSmtpMigrated && !isSendgridMigrated) {
      report.none.push(env.saleorApiUrl);
    }
  }

  console.log("Report", report);
};

runReport();
