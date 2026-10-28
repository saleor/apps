import { type AuthData } from "@saleor/app-sdk/APL";

import { findStaleInstallations } from "./find-stale-installations";
import { deleteTenantKeys, scanTenantKeys, type TenantTable } from "./tenant-keys";

/**
 * Vercel keeps only 256 log lines per request (1 MB total), so stale installations are logged in
 * chunks instead of one line each, and the summary goes out before them.
 */
const LOG_CHUNK_SIZE = 100;

type Logger = {
  info: (message: string, attributes?: Record<string, unknown>) => unknown;
  warn: (message: string, attributes?: Record<string, unknown>) => unknown;
  error: (message: string, attributes?: Record<string, unknown>) => unknown;
};

type Installation = Pick<AuthData, "saleorApiUrl" | "appId">;

/**
 * Removes everything the app stored for installations whose Saleor Cloud environment is gone.
 * Shared body of every app's cleanup cron route; returns the HTTP status and body to answer with.
 */
export const cleanupStaleInstallations = async ({
  getInstallations,
  table,
  cloudApiUrl,
  oidcAudience,
  rootDomains,
  dryRun,
  logger,
  deleteAppData,
}: {
  getInstallations: () => Promise<Installation[]>;
  /** Undefined when the app does not store installations in DynamoDB. */
  table: TenantTable | undefined;
  cloudApiUrl: string | undefined;
  oidcAudience: string | undefined;
  /** Root domains of the Saleor Cloud at `cloudApiUrl`, see `findStaleInstallations`. */
  rootDomains: string[] | undefined;
  dryRun: boolean;
  logger: Logger;
  /**
   * Removes the installation's data the shared cleanup doesn't know about, e.g. outside the table
   * or with another PK format. Runs before any table item is deleted, so it can still read the
   * app's config; throw to keep the installation for the next run.
   */
  deleteAppData?: (installation: Installation) => Promise<void>;
}): Promise<{ status: number; body: Record<string, unknown> }> => {
  if (!table || !cloudApiUrl || !oidcAudience || !rootDomains?.length) {
    logger.error("Stale installations cleanup is not configured, skipping");

    return { status: 201, body: { error: "Not configured" } };
  }

  const installations = await getInstallations();
  const staleResult = await findStaleInstallations({
    installations,
    cloudApiUrl,
    oidcAudience,
    rootDomains,
  });

  if (staleResult.isErr()) {
    logger.error("Failed to find stale installations", { error: staleResult.error });

    return { status: 502, body: { error: "Saleor Cloud check failed" } };
  }

  const { stale, checked, skipped, unknown } = staleResult.value;

  // Cloud reporting every installation gone points at a misconfigured SALEOR_CLOUD_API_URL.
  if (!dryRun && stale.length > 0 && stale.length === checked) {
    logger.error("Refused to delete every installation", { checked });

    return { status: 500, body: { error: "Refused to delete every installation" } };
  }

  const keysByTenant = await scanTenantKeys(table, stale);
  const appIdByUrl = new Map(installations.map(({ saleorApiUrl, appId }) => [saleorApiUrl, appId]));
  const tenants = stale.map((saleorApiUrl) => ({
    saleorApiUrl,
    appId: appIdByUrl.get(saleorApiUrl)!,
    keys: keysByTenant.get(saleorApiUrl) ?? [],
  }));
  const summary = {
    dryRun,
    checked,
    skipped,
    unknown,
    stale: stale.length,
    items: tenants.reduce((sum, { keys }) => sum + keys.length, 0),
  };

  logger.info("Found stale installations", summary);

  for (let i = 0; i < tenants.length; i += LOG_CHUNK_SIZE) {
    logger.info(
      dryRun ? "Would delete stale installations data" : "Deleting stale installations data",
      {
        installations: tenants
          .slice(i, i + LOG_CHUNK_SIZE)
          .map(({ saleorApiUrl, keys }) => ({ saleorApiUrl, items: keys.length })),
      },
    );
  }

  let failedItems = 0;
  const failedAppData: { saleorApiUrl: string; error: string }[] = [];

  if (!dryRun) {
    for (const { saleorApiUrl, appId, keys } of tenants) {
      try {
        await deleteAppData?.({ saleorApiUrl, appId });
      } catch (error) {
        failedAppData.push({ saleorApiUrl, error: String(error) });
        continue;
      }

      failedItems += await deleteTenantKeys(table, saleorApiUrl, keys);
    }
  }

  for (let i = 0; i < failedAppData.length; i += LOG_CHUNK_SIZE) {
    logger.warn("Failed to delete app data, keeping installations for the next run", {
      installations: failedAppData.slice(i, i + LOG_CHUNK_SIZE),
    });
  }

  const result = { ...summary, failedItems, failedAppData: failedAppData.length };

  logger.info("Stale installations cleanup finished", result);

  return { status: 200, body: result };
};
