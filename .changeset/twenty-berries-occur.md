---
"segment": patch
---

- Changed what we sent to Segment to be in sync with their [spec](https://segment.com/docs/connections/spec/ecommerce/v2/)
- Added new Saleor event - `OrderConfirmed` that will be mapped to Segment `OrderCompleted`
- Removed Saleor event - `OrderCreated` - it didn't have respective Segment event
