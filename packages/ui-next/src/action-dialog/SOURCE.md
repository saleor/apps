# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/ActionDialog/ActionDialog.tsx`
- **Commit:** `1f2391dcec285d5dc067e9ca6ceb574b159f9d73`

## Intentional divergences

- Copy is inlined in English (no `react-intl`). Confirm defaults to `"Confirm"` / `"Delete"`;
  the back button defaults to `"Cancel"` rather than Dashboard's translated `"Back"`.
- `onChange` is wrapped so a close is ignored while `disableClose` is set. Dashboard's dialog
  does not lock dismiss during a write; apps that confirm a live mutation (enable/disable all)
  need the dialog to stay up through the request.
- `confirmButtonState` is optional and defaults to `"default"`.
- On `success`, the dialog starts leaving (`closeOnSuccess`, default true). Dashboard often keeps
  the dialog up through the checkmark; apps pair the exit with `afterModalSuccess` so the toast
  lands after the overlay has begun to leave, not on top of a still-open dialog.
