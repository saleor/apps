---
"saleor-app-taxes": minor
---

Set minimum Saleor version where app can be installed (3.10).

Previously, app could have been installed in any Saleor, but if required taxes APIs were missing, app would crash

Now, Saleor will reject installation if possible. If Saleor can't do it, App will check Saleor version during installation and fail it if version doesn't match