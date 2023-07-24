---
"saleor-app-taxes": minor
---

Changed the avatax configuration flow. Previously, the configuration was validated when trying to create it. Now, you have to verify the credentials and address manually by clicking the "verify" buttons. If the address was resolved successfully, formatting suggestions provided by Avatax address resolution service may be displayed. The user can apply or reject the suggestions. If the address was not resolved correctly, an error will be thrown.
