# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/CountPill/CountPill.tsx` + `CountPill.module.css`
- **Commit:** `3508127f50dcd9388ad39b656f906150134eb544`

Used on the Filters button (`ExpressionFilters`, `ModalFilters`) and beside model-type tabs.

## Intentional divergences

- The mono stack lives in the CSS module. Dashboard sets `fontFamily` from a JS constant
  (`MONO_FONT_FAMILY`) via an inline style; apps keep font choice in CSS.
- No CSS `composes`. The active treatment is a second class on the same node.
- `data-active` and `data-test-id`. Dashboard has neither; tests here cannot read hashed
  class names (`css: false`).
- A non-finite `value` (`NaN`, `Infinity`) renders nothing. Dashboard would print the word.
