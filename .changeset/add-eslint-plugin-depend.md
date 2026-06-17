---
"@saleor/eslint-config-apps": minor
---

Added eslint-plugin-depend with the `depend/ban-dependencies` rule. ESLint will now report a warning when code imports redundant packages (e.g. lodash, moment, axios) that have native or better-maintained alternatives.
