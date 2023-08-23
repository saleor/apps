---
"saleor-app-segment": patch
---

Changed semantic Segment events to match exactly Saleor events.
Saleor checkout & order process is more complex than built-in Segment flow, so instead trying to fit, send only custom ones matching events from Saleor webhooks
