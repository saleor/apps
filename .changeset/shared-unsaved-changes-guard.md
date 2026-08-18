---
"@saleor/apps-shared": minor
---

Added `useUnsavedChangesGuard`: holds back in-app navigation while a form has unsaved changes so
the app can ask for confirmation. Apps could not rely on the browser for this — the Dashboard app
iframe is sandboxed without `allow-modals`, so `beforeunload` prompts and `window.confirm` never
appear — and users could silently lose edits by clicking a back link.
