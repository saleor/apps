---
"saleor-app-anonymizer": minor
---

Added a bulk anonymization section. Before, the app could only anonymize a single customer looked up by email. Now the app can also scan the whole store and show how many non-anonymized orders and how many customers (excluding staff accounts) it found, then anonymize all those orders or delete all those customers in one click, with a progress bar. Each anonymized order is marked with the `saleor-anonymized: true` metadata, so already-processed orders are skipped on subsequent scans and failed ones are retried. Records that failed to process are listed as links that open in a new Dashboard tab. The app page was also reorganized into sections with explanatory text, matching the layout of other Saleor apps.
