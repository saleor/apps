---
"app-avatax": patch
---

Changed behavior how tax rate is calculated. It was possible that AvaTax return a non-zero rate, while the actual tax was 0 (for example - product is normally taxable, but this transaction has tax exemption). 

Previously, app returned original, non-zero tax rate as the response together with 0 tax. 

Now, if taxableAmount or total net amount is 0, rate will be also zero
