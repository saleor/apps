# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/Form/ExitFormDialog.tsx`, `src/components/Form/messages.ts`
- **Commit:** `1f2391dcec285d5dc067e9ca6ceb574b159f9d73`

## Intentional divergences

- Built on macaw `Modal` directly instead of `DashboardModal` (`Content` / `Header` / `Actions`),
  which is not vendored yet. Layout follows `@saleor/apps-ui`'s
  `DeleteConfigurationModalContent` so app modals stay consistent.
- Copy is inlined in English (no `react-intl`), matching the rest of `apps-ui-next`.
- Dashboard also blocks page unload via `useBeforeUnload`. Apps cannot: the Dashboard app iframe is
  sandboxed with `allow-same-origin allow-forms allow-scripts allow-downloads allow-popups` — no
  `allow-modals` — so `beforeunload` prompts and `window.confirm` are suppressed. Only in-app
  navigation can be guarded, via `useUnsavedChangesGuard` from `@saleor/apps-shared`.
