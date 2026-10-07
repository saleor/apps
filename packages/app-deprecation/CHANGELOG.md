# @saleor/app-deprecation

## 0.0.1

### Patch Changes

- f59c456: Fixed the daily deprecation job timing out before it reached every store. Before, it updated 5 stores at a time and a single slow store held up the whole group, so with ~2000 installations it hit the 5-minute limit and never finished. Now it handles 25 stores at a time by default (configurable with `DEPRECATION_CRON_PARALLEL_CALLS`), each store gets at most 3 seconds (configurable with `DEPRECATION_CRON_REQUEST_TIMEOUT_MS`), and a slow store no longer holds up the others.

  Stores that no longer exist (deleted environment, or the app's access was revoked) are now counted as `gone` and logged as information instead of warnings, so they no longer appear as failures. The job also logs a summary when it finishes.
