---
"saleor-app-avatax": minor
---

Added a "Show AvaTax tax code" action to the Dashboard command palette (Cmd+K). Before, seeing a product's AvaTax tax code meant scrolling the product page to find the widget; now you can open it from anywhere on a product's detail page without leaving the keyboard. The action opens the same view the widget shows, in a modal. Requires Saleor 3.23+ - on older versions the command palette action is not registered and the widget keeps working as before.
