# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/ConfirmButton/ConfirmButton.tsx` + `ConfirmButton.module.css`
- **Commit:** `1f2391dcec285d5dc067e9ca6ceb574b159f9d73`

## Intentional divergences

- Imports from `@saleor/macaw-ui` instead of `@saleor/macaw-ui-next`.
- Copy is inlined in English (no `react-intl`). `errorLabel` defaults to `"Try again"`; the
  confirm label is required `children` rather than a translated "Save".
- `transitionState` is optional and defaults to `"default"`, so a save bar that is idle does not
  have to pass the prop.
- The throbber and checkmark sit in a relative wrapper over the label so the button width does not
  jump when the status icon replaces the text. Upstream absolutely positions the icon against the
  button itself.
- Does not force `size`, `type`, or `data-test-id`. `Savebar.ConfirmButton` adds the save-bar
  defaults (`large`, `submit`, `button-bar-confirm`); `ActionDialog` uses the dialog defaults.
