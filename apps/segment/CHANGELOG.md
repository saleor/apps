# saleor-app-segment

## 1.0.1

### Patch Changes

- a81f061: Updated Macaw to pre-127
- fcc37e7: Remove clsx package from the projects no longer using it.
- 254cd4c: Fix typo in the UI ("configration" -> "configuration").
- Updated dependencies [2a1385b]
- Updated dependencies [a81f061]
- Updated dependencies [fcc37e7]
  - @saleor/apps-shared@1.8.1
  - @saleor/react-hook-form-macaw@0.2.5
  - @saleor/apps-ui@1.1.8

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
