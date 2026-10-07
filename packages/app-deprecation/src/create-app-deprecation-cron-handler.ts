import { type APL } from "@saleor/app-sdk/APL";
import { type Logger } from "@saleor/apps-logger";
import { withCronAuth } from "@saleor/apps-shared/cron";
import { type NextApiHandler } from "next";
import { type Client } from "urql";

import { declareAppDeprecation } from "./declare-app-deprecation";

/**
 * Builds the cron route that declares the app deprecated on every installation.
 *
 * Installations made after the manifest gained `deprecationReason` already carry it, so this
 * exists for the ones that do not: everything installed earlier, and anything installed against
 * a Saleor below 3.23 that has since been upgraded. There is no install-time hook that would
 * otherwise reach them, and the mutation is a no-op once the value matches, so a daily tick costs
 * one round trip per tenant and eventually converges on all of them.
 *
 * Installations on a Saleor below 3.23 are skipped, and ones whose store or app no longer exists
 * are counted as gone — neither is a failure. Failures are per-tenant and only logged: one
 * unreachable Saleor must not stop the rest of the sweep.
 */
export const createAppDeprecationCronHandler = ({
  cronSecret,
  apl,
  createClient,
  reason,
  logger,
  parallelCalls,
  requestTimeoutMs,
}: {
  /** The app's `CRON_SECRET`. While unset, every request is refused. */
  cronSecret: string | undefined;
  apl: Pick<APL, "getAll">;
  /** The app's own client factory, so requests carry its User-Agent and instrumentation. */
  createClient: (args: { saleorApiUrl: string; token: string }) => Client;
  /** Same string the manifest sends as `deprecationReason`. */
  reason: string;
  logger: Pick<Logger, "info" | "warn">;
  /** Installations handled concurrently. The whole sweep must fit in the function's max duration. */
  parallelCalls: number;
  /** Per-installation cap, so one hanging Saleor holds up a single worker for at most this long. */
  requestTimeoutMs: number;
}): NextApiHandler => {
  const handler: NextApiHandler = async (_req, res) => {
    const installations = await apl.getAll();

    logger.info("Declaring deprecation", { installationsCount: installations.length });

    let failed = 0;
    let skipped = 0;
    let gone = 0;

    // Workers share one iterator, so each picks the next installation as soon as it is free.
    const queue = installations.values();

    await Promise.all(
      Array.from({ length: parallelCalls }, async () => {
        for (const { saleorApiUrl, token } of queue) {
          const client = createClient({ saleorApiUrl, token });
          const result = await declareAppDeprecation(client, reason, {
            timeoutMs: requestTimeoutMs,
          });

          if (result.isErr()) {
            failed += 1;
            logger.warn("Failed to declare deprecation for an installation", {
              error: result.error,
              saleorApiUrl,
            });
          } else if (result.value === "unsupported") {
            skipped += 1;
          } else if (result.value === "gone") {
            gone += 1;
            logger.info("Installation no longer exists, skipping deprecation", { saleorApiUrl });
          }
        }
      }),
    );

    const summary = { total: installations.length, failed, skipped, gone };

    logger.info("Declared deprecation", summary);

    return res.status(200).json(summary);
  };

  return withCronAuth({ secret: cronSecret, logger }, handler);
};
