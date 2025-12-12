---
"saleor-app-search": patch
---

Added logs and spans for tracing time of external API calls. When making API request, app will start timer and produce `debug` logs:
- on start
- on finish

App will additionally send `warning` logs when expected time for API request is exceeded:
- Algolia API calls - 10s
- Saleor API calls - 5s
- DynamoDB API calls - 1s
