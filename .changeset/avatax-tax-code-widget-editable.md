---
"saleor-app-avatax": patch
---

Fixed the "Show AvaTax tax code" command palette modal rendering only a sliver of its content - it now fills the modal instead of being clipped to a ~20px strip.

The product details sidebar widget also lets you change the AvaTax tax code now, rather than only reporting it and pointing you at the app configuration.

In both places the tax code picker is hidden until AvaTax credentials are configured, since it searches codes through the connection and would otherwise be an empty box that never returns a result. Without credentials the mapping is shown read-only with a note about connecting them.
