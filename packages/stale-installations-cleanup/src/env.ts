import { booleanEnv } from "@saleor/apps-shared/boolean-env";
import { z } from "zod";

// `.env.example` lists these empty.
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

/**
 * Spread into the `server` section of createEnv() in each app's env.ts. All optional so
 * deployments keep booting; the cron route refuses to run until the Cloud ones are set.
 */
export const staleInstallationsCleanupServerSchema = {
  // Saleor Cloud API base, e.g. https://cloud.saleor.io/platform/api
  SALEOR_CLOUD_API_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  // Audience of the Vercel OIDC token Saleor Cloud accepts, e.g. https://cloud.saleor.io/platform/api:service-accounts
  SALEOR_CLOUD_OIDC_AUDIENCE: z.preprocess(emptyToUndefined, z.string().optional()),
  /*
   * Root domains of the Saleor Cloud the app talks to, comma separated, e.g. `saleor.cloud,eu.saleor.cloud`.
   * Only installations at `<label>.<root domain>` are cleaned up; self-hosted, custom domain and other
   * Cloud environments' (e.g. `staging.saleor.cloud`) installations are kept.
   */
  SALEOR_CLOUD_ROOT_DOMAINS: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .optional()
      .transform(
        (value) =>
          value
            ?.split(",")
            .map((domain) => domain.trim().replace(/^\./, ""))
            .filter(Boolean),
      ),
  ),
  // Only log what the stale installations cleanup cron would delete. Set to `false` to delete.
  STALE_INSTALLATIONS_CLEANUP_DRY_RUN: booleanEnv.defaultTrue,
};

/** Spread into the `runtimeEnv` section of createEnv() in each app's env.ts. */
export const staleInstallationsCleanupRuntimeEnv = {
  SALEOR_CLOUD_API_URL: process.env.SALEOR_CLOUD_API_URL,
  SALEOR_CLOUD_OIDC_AUDIENCE: process.env.SALEOR_CLOUD_OIDC_AUDIENCE,
  SALEOR_CLOUD_ROOT_DOMAINS: process.env.SALEOR_CLOUD_ROOT_DOMAINS,
  STALE_INSTALLATIONS_CLEANUP_DRY_RUN: process.env.STALE_INSTALLATIONS_CLEANUP_DRY_RUN,
};
