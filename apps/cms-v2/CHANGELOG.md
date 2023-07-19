# saleor-app-cms-v2

## 2.1.0

### Minor Changes

- 5d41af9: Added validation for channel-provider connection. Now form will display error when user tries to add a connection that already exists.
- 5d41af9: Added set of improvements around app quality

  - Ensured forms have fields properly set as "required", so form validation will prevent empty form submissions
  - Contentful and DatoCMS forms now validate the credentials.
  - Added logs (server side) in various places
  - Bulk sync finished now triggers notification

- 5d41af9: Added skeletons instead raw "Loading" texts. Also removed unnecessary warning message in bulk sync section

### Patch Changes

- Updated dependencies [70cb741]
- Updated dependencies [e7c2d3a]
- Updated dependencies [3c6cd4c]
- Updated dependencies [6210447]
  - @saleor/react-hook-form-macaw@0.2.1
  - @saleor/apps-shared@1.7.4
  - @saleor/apps-ui@1.1.4
