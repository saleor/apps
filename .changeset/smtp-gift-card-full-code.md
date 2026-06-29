---
"saleor-app-smtp": patch
---

Fixed the default "Gift card sent" email template so it shows the full redeemable gift card code instead of the masked display code. Before, the email rendered `giftCard.displayCode`, which only contains the last 4 characters of the code, so customers could not actually redeem the gift card. Now the template uses `giftCard.code` and shows the complete code.
