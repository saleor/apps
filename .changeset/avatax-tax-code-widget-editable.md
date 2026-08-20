---
"saleor-app-avatax": minor
---

Fixed the "Show AvaTax tax code" command palette modal rendering only a sliver of its content - it now fills the modal instead of being clipped to a ~20px strip.

The product details sidebar widget gained an "Edit tax code" button that opens that same modal, where the AvaTax tax code can be changed. Previously the widget only reported the code and told you to go to the app configuration. The same modal is now also available from the product page's "..." menu as "Edit AvaTax tax code".

Changing the tax code in the modal now refreshes the product behind it, so its tax section and the sidebar widget show the new code straight away instead of staying stale until you reload the page.

The tax code picker stays hidden until AvaTax credentials are configured, since it searches codes through the connection and would otherwise be an empty box that never returns a result. Without credentials the mapping is shown read-only with a note about connecting them.
