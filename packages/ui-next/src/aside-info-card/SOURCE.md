# Upstream source

- **Original:** designed for Saleor Apps left-rail legends / hints (Stripe Test vs Live).
- Not a direct Dashboard port. Related idea: foldable disclosure like `DetailGroupBox`,
  but chrome is intentionally lighter — no tinted header band.

## Intent

Minimal bordered info surface for settings left rails and hint panels:

- Body: title + content (no `default2` header band — must not look like `SettingsSection` / `DetailSettingsCard`)
- Optional foldable footer for secondary how-to content
- Optional `collapsible`, which turns the title into a disclosure for the whole card. For a rail
  card that explains a mechanism rather than hinting at the form beside it: worth its length once,
  in the way afterwards. `defaultCollapsed` starts it closed; nothing remembers the state between
  visits either way. Composes with the footer `fold`, which stays shut until the card is opened.
