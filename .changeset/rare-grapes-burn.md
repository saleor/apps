---
"segment": patch
---

- Fixed bug in webhook migration script that was causing app webhooks to be disabled by migration
- Awaited Segment flush event - after this change events will be properly send to Segment
- Added user email to properties sent to Segment.
