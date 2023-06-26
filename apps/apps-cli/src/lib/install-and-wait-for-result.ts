import ora from "ora";
import { fetchAppManifest } from "./fetch-app-manifest";
import { filterApps } from "./filter-apps";
import { getAppInstallationsListQuery } from "../saleor-api/operations/get-app-installations-list-query";
import { getAppsListQuery } from "../saleor-api/operations/get-apps-list-query";
import { installAppMutation } from "../saleor-api/operations/install-app-mutation";

interface InstallAndWaitForResultArgs {
  saleorApiUrl: string;
  token: string;
  appManifestUrl: string;
}

function delay(timeMs: number) {
  return new Promise((resolve) => setTimeout(resolve, timeMs));
}

/*
 * Attempt to install app from the manifest, wait for the operation to complete
 * and return app installation result.
 * If will throw error if any of the steps fails.
 */
export const installAndWaitForResult = async ({
  saleorApiUrl,
  token,
  appManifestUrl,
}: InstallAndWaitForResultArgs) => {
  const manifestSpinner = ora("Fetching app manifest").start();

  const manifestData = await fetchAppManifest(appManifestUrl);

  manifestSpinner.succeed();

  const installSpinner = ora("Installing the app").start();

  const appInstallationJob = await installAppMutation({
    manifestUrl: appManifestUrl,
    saleorApiUrl: saleorApiUrl,
    token,
    appName: manifestData.name,
  });

  installSpinner.text = `Installing the app (job id: ${appInstallationJob.id})`;

  // Lets give the API a bit of time to process installation
  await delay(1000);

  // App installation is on progress, now we have to monitor if it resolved. Wait max 20s for the result
  for (let i = 0; i < 10; i++) {
    const currentAppInstallations = await getAppInstallationsListQuery({
      saleorApiUrl: saleorApiUrl,
      token,
    });

    const appInstallation = currentAppInstallations.find((x) => x.id === appInstallationJob.id);

    if (!appInstallation) {
      // Job has been processed! If not on the list, it means it was successful
      break;
    }

    if (appInstallation.status === "FAILED") {
      installSpinner.fail("Installation failed");
      throw new Error("App installation failed: " + appInstallation.message);
    }

    // Wait a bit and check again
    await delay(2000);
  }

  installSpinner.text = "Confirming the app installed";

  // App should be installed by now, fetch its details
  const currentAppInstallations = await getAppsListQuery({
    saleorApiUrl,
    token,
  });

  const installedApp = filterApps({
    apps: currentAppInstallations,
    filter: {
      manifestUrl: appManifestUrl,
    },
  });

  if (!installedApp.length) {
    // Investigate if this can happen - app not in the list of installed apps nor in the list of installations
    throw new Error("App not found on the list of installed apps");
  }

  installSpinner.succeed("App installed!");

  return installedApp[0];
};
