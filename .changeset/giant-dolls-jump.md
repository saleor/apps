---
"saleor-app-smtp": patch
---

App will now correctly parse email templates that use handlers from handlebars-helpers (e.g. `equals`). Previously app threw an error when clicking "Render template".
