# saleor-app-segment

## 1.0.0

### Major Changes

- 7d574c7: Introduced a Segment.io app that integrates order events with Segment tracking

### Patch Changes

- 8b3d961: Updated Macaw UI to pre.118
- c50797e: Extracted MetadataManager creation to factory from shared package
- 6ea3e38: Changed semantic Segment events to match exactly Saleor events.
  Saleor checkout & order process is more complex than built-in Segment flow, so instead trying to fit, send only custom ones matching events from Saleor webhooks
- Updated dependencies [8b3d961]
- Updated dependencies [c50797e]
  - @saleor/react-hook-form-macaw@0.2.4
  - @saleor/apps-shared@1.8.0
  - @saleor/apps-ui@1.1.7
