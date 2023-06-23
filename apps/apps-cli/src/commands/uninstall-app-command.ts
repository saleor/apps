import { checkbox, confirm } from "@inquirer/prompts";
import { getAccessTokenMutation } from "../saleor-api/operations/get-access-token-mutation";
import { getAppsListQuery } from "../saleor-api/operations/get-apps-list-query";
import { uninstallAppMutation } from "../saleor-api/operations/uninstall-app-mutation";
import { filterApps } from "../lib/filter-apps";
import ora from "ora";

interface UninstallAppCommandArgs {
  instanceUrl: string;
  userEmail: string;
  userPassword: string;
  manifestUrl?: string;
  appName?: string;
  appId?: string;
  all?: boolean;
  force?: boolean;
}

export const uninstallAppCommand = async ({
  instanceUrl,
  manifestUrl,
  userEmail,
  userPassword,
  all,
  force,
  appId,
  appName,
}: UninstallAppCommandArgs) => {
  const loginSpinner = ora("Logging into Saleor instance").start();

  const token = await getAccessTokenMutation({
    email: userEmail,
    password: userPassword,
    saleorApiUrl: instanceUrl,
  });

  loginSpinner.succeed();

  const appIdsToRemove: string[] = [];

  if (appId) {
    appIdsToRemove.push(appId);
  } else {
    const appListSpinner = ora("Fetching installed apps").start();

    const installedApps = await getAppsListQuery({
      saleorApiUrl: instanceUrl,
      token,
    });

    appListSpinner.succeed();

    // Display CLI interface with multiselect if none of the filters were provided
    if (appId || appName || manifestUrl) {
      const filteredApps = filterApps({
        apps: installedApps,
        filter: {
          id: appId,
          name: appName,
          manifestUrl: manifestUrl,
        },
      });

      appIdsToRemove.push(...filteredApps.map((app) => app.id));
    } else if (all) {
      appIdsToRemove.push(...installedApps.map((app) => app.id));
    } else {
      const selectedIds = await checkbox({
        message: "Select apps to uninstall",
        choices: installedApps.map((app) => ({
          name: app.name ? `${app.name} (${app.id}) ${app.type}` : app.id,
          value: app.id,
        })),
      });

      appIdsToRemove.push(...selectedIds);
    }
  }
  const confirmed = force
    ? true
    : await confirm({
        message: `${appIdsToRemove.length} apps will be removed. Continue?`,
        default: false,
      });

  if (!confirmed) {
    console.log("Operation aborted - no confirmation");
    return;
  }

  const uninstallSpinner = ora("Uninstalling apps").start();

  try {
    await Promise.all(
      appIdsToRemove.map((appId) =>
        uninstallAppMutation({ saleorApiUrl: instanceUrl, token, id: appId })
      )
    );
  } catch (e) {
    uninstallSpinner.fail();
    console.error(e);
    return;
  }
  uninstallSpinner.succeed();
};
