---
"saleor-app-taxes": minor
---

Improved the Sentry setup. When Sentry is successfully configured, the app should report all the events accordingly to the severity specified in the `NEXT_PUBLIC_SENTRY_REPORT_LEVEL`. All the errors now have a new property: `sentrySeverity`. The app now uses new environment variables: `VERCEL`, `VERCEL_GIT_COMMIT_SHA`, `NEXT_PUBLIC_SENTRY_REPORT_LEVEL` and `GITHUB_SHA`. To ensure the correct building of source maps, before performing a deploy to Vercel build, the app will now provide the release tag in a `SENTRY_RELEASE` env var.
