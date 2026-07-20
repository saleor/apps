---
"saleor-app-smtp": minor
---

Added a "Custom variables" section to each SMTP configuration. You can now define your own global key-value pairs (e.g. `storefrontUrl`, `supportEmail`) instead of hard-coding them into templates, and reference them in any email template for that configuration as `{{customVariables.yourKey}}`.

Before: values like the storefront URL had to be pasted into every template by hand and updated in many places. After: define them once per configuration and use `{{customVariables.storefrontUrl}}` everywhere; the live template preview and editor autocomplete reflect your saved values (branding values now show in the preview too).
