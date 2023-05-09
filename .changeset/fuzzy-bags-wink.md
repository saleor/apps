---
"saleor-app-invoices": minor
---

Major update of the App UI and behavior:
- Replaced old Macaw/MUI with @saleor/macaw-ui/next (new UI, new look)
- Changed App behavior how settings are stored. Before - it cloned shop data and stored it per-channel in App settings (metadata). Now it uses Shop data by default + overrides per channel

App includes migration code, it should work seamlessly and update its settings/schema automatically.


