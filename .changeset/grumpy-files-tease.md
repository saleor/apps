---
"@saleor/apps-logger": minor
---

Improved logger implementation internals. Now it will inherit parent-logger attributes (only 1 level, which is internal tslog limitation). It uses custom console printer if attached, by default doesn't print anything, because built-in pretty print is limited and has to be disabled.
