# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/Form/ExitFormDialog.tsx`, `src/components/Form/messages.ts`
- **Commit:** `1f2391dcec285d5dc067e9ca6ceb574b159f9d73`

## Intentional divergences

- Copy is inlined in English (no `react-intl`), matching the rest of `apps-ui-next`.
- Dashboard also blocks page unload via `useBeforeUnload`. Apps cannot show that native prompt:
  the iframe is sandboxed without `allow-modals`. `useUnsavedChangesGuard` instead traps ⌘R /
  Ctrl+R / F5 (while the iframe has focus) and Pages Router transitions — including browser Back
  inside the app — and opens this dialog. Navigating Dashboard itself away from the app still
  unmounts the iframe.
