# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/SetupChecklist/`
- **Commit:** `1f2391dcec285d5dc067e9ca6ceb574b159f9d73`

## Intentional divergences

- Imports from `@saleor/macaw-ui` instead of `@saleor/macaw-ui-next`.
- Progress counter renders `{done} of {total}` as plain text (no `react-intl`).
- Success status icon uses the same hardcoded green as Dashboard’s `getDotColor("success")`
  (`hsla(173, 100%, 26%, 1)`) instead of importing `@dashboard/misc`.
- Includes `.elevated` / `.elevatedDark` helpers (from ChannelSetupCard smooth-shadow-ring)
  so callers can lift the checklist without a second CSS fork.
- Apps-only `ParkedSetupChecklist`: compact restore affordance for dismissed checklists
  (no Dashboard upstream). Lives in the main column; replaces page-header “Show checklist”
  buttons.
