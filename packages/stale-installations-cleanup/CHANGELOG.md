# @saleor/stale-installations-cleanup

## 0.3.1

### Patch Changes

- Updated dependencies [840a60d]
  - @saleor/apps-shared@1.17.4

## 0.3.0

### Minor Changes

- cf92cf5: Stale installations cleanup now only removes data of installations on the Saleor Cloud it is configured for. Set `SALEOR_CLOUD_ROOT_DOMAINS` to that Cloud's root domains, comma separated, e.g. `saleor.cloud,eu.saleor.cloud`. Until it is set, the job doesn't run.

  Before, Saleor Cloud reported any environment it doesn't host as gone, so data of installations on another Saleor Cloud (e.g. staging), on self-hosted Saleor or on custom domains would have been removed. Now only installations at `<name>.<root domain>` are checked; everything else is kept and counted as `skipped` in the summary.

- 888f9ab: When the stale installations cleanup removes data of a deleted Saleor Cloud environment, the Stripe app now also deletes that environment's webhooks in the merchant's Stripe account, using each configuration's restricted key. Before, those webhooks stayed and Stripe kept sending events to the app for an environment that no longer exists.

  A webhook that is already gone, or a restricted key that was revoked, counts as done. On any other error the installation's data is kept and the next run tries again.

## 0.2.0

### Minor Changes

- b08cb53: Stale installations cleanup logs now fit in Vercel's limit of 256 log lines per request. Before, it logged one line per stale installation, so with many of them the remaining installations and the final summary were dropped from the logs. Now it logs the summary (`checked`, `unknown`, `stale`, `items`) first, then lists stale installations 100 per line, then the result.

## 0.1.0

### Minor Changes

- c94bfe4: The app now cleans up after deleted Saleor Cloud environments. A daily job asks Saleor Cloud which environments the app is installed in still exist, by their Saleor Cloud or custom domain, and removes everything the app stored for those that are gone. Before, data of deleted environments stayed in the app's database indefinitely.

  The job only runs once `CRON_SECRET`, `SALEOR_CLOUD_API_URL` and `SALEOR_CLOUD_OIDC_AUDIENCE` are set. It starts in dry-run mode, logging what it would remove; set `STALE_INSTALLATIONS_CLEANUP_DRY_RUN=false` to delete.
