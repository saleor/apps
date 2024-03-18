import * as dotenv from "dotenv";
import { fetchCloudAplEnvs, verifyRequiredEnvs } from "./migration-utils";
import { updateWebhooks } from "./update-webhooks";

dotenv.config();

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

const runMigration = async () => {
  console.log(`Starting webhooks migration ${dryRun ? "(dry run)" : ""}`);

  verifyRequiredEnvs();

  console.log("Fetching environments from the Cloud APL");

  const allEnvs = await fetchCloudAplEnvs().catch((r) => {
    console.error("Could not fetch instances from the Cloud APL");
    console.error(r);

    process.exit(1);
  });

  for (const env of allEnvs) {
    await updateWebhooks({ authData: env, dryRun });
  }

  console.log(`Webhook migration ${dryRun ? "(dry run)" : ""} complete`);
};

runMigration();
