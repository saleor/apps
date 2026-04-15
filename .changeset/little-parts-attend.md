---
"saleor-app-products-feed": patch
"saleor-app-payment-np-atobarai": patch
"saleor-app-klaviyo": patch
"saleor-app-segment": patch
"saleor-app-avatax": patch
"saleor-app-search": patch
"saleor-app-payment-stripe": patch
"saleor-app-smtp": patch
"saleor-app-cms": patch
---

Added support for OIDC between AWS and Vercel (using `@vercel/oidc-aws-credentials-provider`). Now, when `AWS_ARN` env variable is provided, it will take precedence over IAM secrets. This is more secure way to authenticate and is preferred. IAM secrets stay supported, e.g. for local DynamoDB setup.
