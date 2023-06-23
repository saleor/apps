import { installAndWaitForResult } from "../lib/install-and-wait-for-result";
import { getAccessTokenMutation } from "../saleor-api/operations/get-access-token-mutation";
import ora from "ora";

interface InstallAppCommandArgs {
  instanceUrl: string;
  userEmail: string;
  userPassword: string;
  manifestUrl: string;
}

export const installAppCommand = async ({
  instanceUrl,
  manifestUrl,
  userEmail,
  userPassword,
}: InstallAppCommandArgs) => {
  const loginSpinner = ora("Logging into Saleor instance").start();

  const token = await getAccessTokenMutation({
    email: userEmail,
    password: userPassword,
    saleorApiUrl: instanceUrl,
  });

  loginSpinner.succeed();

  const installedAppData = await installAndWaitForResult({
    saleorApiUrl: instanceUrl,
    token,
    appManifestUrl: manifestUrl,
  });

  console.log(`App ${installedAppData.name} (${installedAppData.id}) installed!`);
};
