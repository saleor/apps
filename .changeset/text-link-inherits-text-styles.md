---
"@saleor/apps-ui": minor
---

`TextLink` now looks like a Dashboard in-product link. Before: always blue (`info1`) with its own
font size, so inline links stood out from the sentence around them. Now: it inherits the
surrounding text color and size, underlines on hover, and external links get a small
"open in new tab" icon. Pass `color` or `size` explicitly to opt out.
