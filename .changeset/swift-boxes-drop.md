---
"saleor-app-crm": minor
---

Implemented app-sdk@0.39.1 and used its MetadataManager's "delete" method. Now, app will remove config from metadata using "removePrivateMetadata" mutation, instead of setting it to undefined. Previous behaviour was caused by app-sdk not having "delete" method yet
