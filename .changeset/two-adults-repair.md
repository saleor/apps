---
"app-avatax": minor
---

Added caching to App Metadata. Now, when webhook is called by Saleor, metadata from payload will be cached and consumed in MetadataManager. If cache doesn't exist, MetadataManager will fetch missing metadata. This change removes unnecessary graphql call that was timing out the handler.
