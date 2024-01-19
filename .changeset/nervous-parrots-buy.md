---
"@saleor/apps-logger": patch
---

Fixed mapping inherited attributes in logger to be sent via otel. Now, child logger attributes will be merged with each single log arguments
