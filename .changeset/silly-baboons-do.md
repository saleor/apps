---
"app-avatax": minor
---

Added new cron endpoint for preheating checkout & order calculate taxes endpoints. This cron will run every 5 minutes calling app endpoints so we get preheated handlers and it should reduce timeouts.
