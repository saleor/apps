/* eslint-disable turbo/no-undeclared-env-vars */

import * as dotenv from "dotenv";
import { fetchCloudAplEnvs, getMetadataManagerForEnv, verifyRequiredEnvs } from "./migration-utils";

import { SendgridPrivateMetadataManager } from "../../src/modules/sendgrid/configuration/sendgrid-metadata-manager";
import { SmtpPrivateMetadataManager } from "../../src/modules/smtp/configuration/smtp-metadata-manager";

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
    smtp: [] as string[],
    sendgrid: [] as string[],
    none: [] as string[],
  };

  for (const env of allEnvs) {
    let isSmtpMigrated = false;
    let isSendgridMigrated = false;

    console.log("Working on env: ", env.saleorApiUrl);

    const metadataManager = getMetadataManagerForEnv(env.saleorApiUrl, env.token, env.appId);

    const sendgridMetadataManager = new SendgridPrivateMetadataManager(
      metadataManager,
      env.saleorApiUrl
    );

    const sendgridUpdatedSchema = await sendgridMetadataManager.getConfig();

    if (sendgridUpdatedSchema) {
      console.log("Migrated sendgrid configuration found, overriding");
      isSendgridMigrated = true;
      await sendgridMetadataManager.setConfig(sendgridUpdatedSchema);
    }

    const smtpMetadataManager = new SmtpPrivateMetadataManager(metadataManager, env.saleorApiUrl);

    const smtpUpdatedSchema = await smtpMetadataManager.getConfig();

    if (smtpUpdatedSchema) {
      console.log("Migrated smtp configuration found, overriding");
      isSmtpMigrated = true;
      await smtpMetadataManager.setConfig(smtpUpdatedSchema);
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

runMigration();
