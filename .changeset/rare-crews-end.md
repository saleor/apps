---
"@saleor/apps-logger": minor
---

If Vercel runtime transport log is exceeding Vercel log limit (4kb) error to Sentry will be logged as it won't be visible in log drain.
