# segment

## 2.0.3

### Patch Changes

- b61ce914: Added DynamoDB APL. This APL is using DynamoDB as storage.
- 820f5b90: Cleanup Segment app - rename of files or fix naming.
- 36aea8d9: Store app config in DynamoDB instead of Saleor app metadata.

## 2.0.2

### Patch Changes

- 0db174a8: Removed regex escape for `ALLOWED_DOMAINS_URL` env variable from register handler. It isn't user input and escaping regex was causing problem with apps installation.

## 2.0.1

### Patch Changes

- Updated dependencies [9bbf9ee5]
- Updated dependencies [9bbf9ee5]
  - @saleor/apps-logger@1.4.3
  - @saleor/react-hook-form-macaw@0.2.12
  - @saleor/webhook-utils@0.2.3
  - @saleor/apps-shared@1.11.4
  - @saleor/apps-otel@1.3.5
  - @saleor/apps-ui@1.2.10
