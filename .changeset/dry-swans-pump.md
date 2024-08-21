---
"search": patch
---

The feature allowing app to disable its own webhooks was removed. Initially it was designed to update webhooks after the new version of the app (with new webhooks) was released.
Now, app contains migration script that runs on the deployment and webhooks are automatically recreated, so the feature is no longer needed.