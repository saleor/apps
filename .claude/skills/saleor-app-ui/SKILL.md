---
name: saleor-app-ui
description: >
  Styling and layout guide for Saleor Apps using modern macaw-ui and
  @saleor/apps-ui-next. Use when creating, refactoring, or modifying React
  components in apps or packages/ui-next — especially layout, spacing, colors,
  borders, setup checklists, or settings cards. Triggers on component creation,
  UI refactors, and style-related tasks in the apps monorepo.
---

# Saleor App UI

Apps mounted in the Saleor Dashboard must match Dashboard configuration chrome.
Shared primitives live in **`@saleor/apps-ui-next`**. Legacy **`@saleor/apps-ui`**
(`Layout.AppSection`, `ConfigsList`, …) is frozen; do not add new components there.

**Architecture:** see [ADR 0004](../../../adr/0004-dashboard-aligned-ui-layer.md).

**Macaw:** import from `@saleor/macaw-ui` only (modern design system). Never add
legacy `@saleor/macaw-ui@0.7.x`. Dashboard’s `@saleor/macaw-ui-next` alias points
at the same modern package family.

**Elevation:** Use shadows sparingly. When a surface truly floats (modal, popover,
menu, setup checklist), follow [Elevated surfaces](#elevated-surfaces) — never
`border` + `box-shadow` on the same elevated node.

---

## Full-bleed document (required)

The document must be full bleed: the app renders inside a Dashboard iframe that already
provides the outer chrome, and the page primitives (`AppPageHeader`, `DetailPageLayout`,
`SettingsPageContent`) own every inset. Import the reset once in `_app.tsx`, after Macaw:

```tsx
import "@saleor/macaw-ui/style";
import "@saleor/apps-ui-next/style";
```

It resets the browser default `body { margin: 8px }` — which otherwise insets the whole
frame and misaligns app content with Dashboard content — and gives `#__next` `height: 100%`
so `DetailPageLayout`'s `min-height: 100%` resolves and a fixed `Savebar` can sit at the
bottom of the frame instead of under the content.

Never add page padding to `body` or a page-level wrapper; if content needs breathing room,
it belongs in the layout primitive that owns that region.

---

## Strategy 1: Box inline props (simple styles)

Use `<Box>` from `@saleor/macaw-ui` when you need a few CSS properties (layout,
spacing, colors).

```tsx
import { Box, Text } from "@saleor/macaw-ui";

<Box display="flex" gap={2} alignItems="center" padding={4} backgroundColor="default1">
  <Text color="default2" size={2}>
    Label
  </Text>
</Box>;
```

Box supports sprinkle props for: `display`, `flexDirection`, `alignItems`,
`justifyContent`, `gap`, `padding*`, `margin*`, `width`, `height`, `borderRadius`,
`backgroundColor`, `position`, `cursor`, `opacity`, `flexGrow`, `flexShrink`,
`flexWrap`, `gridTemplateColumns`, `gridColumn`, `order`.

All spacing/sizing props accept token numbers:
`0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 14 | 16 | 20 | 24 | 28 | 32 | 36 | 40 | 44 | 48 | 52`

Responsive values work for **layout** props only (`display`, `grid*`, `flex*`,
`order`, …):

```tsx
<Box display={{ mobile: "none", tablet: "flex", desktop: "grid" }} />
```

**Do not** use responsive objects for spacing (`padding*`, `margin*`, `gap`).
Macaw types allow it, but runtime sprinkles only accept state conditions
(`default` / `hover` / …) for those props and will throw `SprinklesError`
(breaks tests and the live app). Use a CSS module media query instead:

```css
.root {
  padding-inline: var(--mu-spacing-6);
}
@media (max-width: 768px) {
  .root {
    padding-inline: var(--mu-spacing-3);
  }
}
```

Escape hatch for arbitrary CSS values via `__` prefix:

```tsx
<Box __width="25%" __transition="background-color 0.2s ease" __minWidth="200px" />
```

Hover/state-dependent values:

```tsx
<Box backgroundColor={{ default: "transparent", hover: "default2" }} />
```

### When Box props are enough

- Flex/grid layouts with spacing
- Padding, margin, gap adjustments
- Background and text colors from the design system
- Border radius
- Simple responsive breakpoints (layout only)

## Strategy 2: CSS Modules (complex styles)

Use `.module.css` when you need pseudo-selectors, animations, media queries,
complex selectors, or more than ~5 CSS rules.

Create `ComponentName.module.css` next to `ComponentName.tsx`. One CSS file per
component. Never share CSS module files across components.

```css
/* SearchInput.module.css */
.input {
  flex: 1;
  border: none;
  outline: none;
  background-color: transparent;
  font-size: 14px;
  color: var(--mu-colors-text-default1);
  min-width: 0;
}

.input::placeholder {
  color: var(--mu-colors-text-default2);
}
```

```tsx
import styles from "./SearchInput.module.css";

<input className={styles.input} />;
```

### When to use CSS Modules

- Pseudo-selectors: `::placeholder`, `:hover`, `:focus`, `[data-state="open"]`
- Animations/transitions: `@keyframes`, complex `transition`
- Media queries: `@media (min-width: 960px)`
- Nested/compound selectors: `.row:hover .icon`
- More than ~5 CSS rules for a single element

## Design tokens

Always use macaw CSS variables instead of hardcoded values (especially colors,
spacing, borders).

### In CSS Modules

Use `var(--mu-*)` variables. Full list:
`node_modules/@saleor/macaw-ui/dist/style.css`

```css
color: var(--mu-colors-text-default1);
background-color: var(--mu-colors-background-default2);
border: 1px solid var(--mu-colors-border-default1);
```

### In TypeScript

Import `vars` from `@saleor/macaw-ui` for JS-accessible tokens:

```tsx
import { vars } from "@saleor/macaw-ui";

vars.spacing[2];
vars.colors.border.default1;
vars.colors.text.default2;
```

Token typings: `node_modules/@saleor/macaw-ui/dist/theme/contract.css.d.ts`

## Layout family (`@saleor/apps-ui-next`)

| Need | Use |
| ---- | --- |
| Page shell (iframe-mounted config) | `DetailPageLayout` + `.Content` / `.RightSidebar` |
| Title / actions bar (not Dashboard TopNav) | `AppPageHeader` |
| Bottom form actions | `Savebar` (fixed to iframe bottom; no Radix portal — apps lack Dashboard’s footer slot) |
| Configuration hub (left rail + forms) | `SettingsPageContent` (`1fr` / `3fr`) |
| Settings card with Shop / Channel scope | `SettingsSection` + `ownership` |
| Scope pill | `SettingsOwnershipChip` (`shop` \| `channel`) |
| Left-rail legend / hint (no tinted header) | `AsideInfoCard` (+ optional fold footer) |
| Primary bordered settings block (entity detail) | `DetailSettingsCard` |
| Secondary foldable section (SEO-style) | `DetailGroupBox` (`variant="secondary"`) |
| Full-bleed fold inside a settings card | `DetailGroupBox` (`variant="flush"`) |
| Guided setup with tasks + review rows | `SetupChecklist` |
| Dismissed setup (parked restore) | `ParkedSetupChecklist` |
| Unsaved-changes confirmation | `ExitFormDialog` (+ `useUnsavedChangesGuard` from `@saleor/apps-shared`) |

### App shell contract

Wrap app pages so layout owns spacing (do **not** add a global `<Box padding={10}>`
around every page — it fights `DetailPageLayout` / `AppPageHeader`):

```tsx
import { DetailPageLayout, AppPageHeader, DetailSettingsCard, Savebar } from "@saleor/apps-ui-next";

<DetailPageLayout withSavebar>
  <AppPageHeader title="Configuration" actions={docsLink} />
  <DetailPageLayout.Content>
    <Box padding={6} display="flex" flexDirection="column" gap={6}>
      <DetailSettingsCard title="…">{/* … */}</DetailSettingsCard>
    </Box>
  </DetailPageLayout.Content>
  <Savebar>
    <Savebar.Spacer />
    <Savebar.CancelButton>Cancel</Savebar.CancelButton>
    <Savebar.ConfirmButton>Save</Savebar.ConfirmButton>
  </Savebar>
</DetailPageLayout>
```

Consuming Next apps must list `@saleor/apps-ui-next` in `transpilePackages` (CSS modules).

Do not mix legacy `@saleor/apps-ui` `Layout.AppSection` with these primitives on
the same page.

### Forms and the save bar

Dashboard uses a bottom save bar on every create **and** edit page (products, variants,
customers, warehouses, staff) and on settings hubs (`SiteSettingsPage`, `OrderSettingsPage`) —
never a save button inside a card. Apps follow the same rule: **one page, one form, one save
bar.** A page that lists several independently editable entities (e.g. per-config channel
assignment) keeps its actions inside each card instead, because a page-level bar cannot express
which card it would commit.

The page owns `react-hook-form` and passes `control` down to presentational field components, so
the save bar can read `formState.isDirty`:

```tsx
const { handleSubmit, control, formState: { errors, isDirty, isSubmitSuccessful } } = useForm({...});
const guard = useUnsavedChangesGuard({ enabled: isDirty && !isSubmitSuccessful });

<Savebar>
  {/* Delete belongs to entity pages only — create pages omit it. */}
  <Savebar.DeleteButton onClick={openDeleteModal}>Delete</Savebar.DeleteButton>
  <Savebar.Spacer />
  <Savebar.CancelButton onClick={() => guard.navigateWithoutGuard("/config")}>Cancel</Savebar.CancelButton>
  <Savebar.ConfirmButton
    form={FORM_ID}
    disabled={!isDirty || isSaving}
    transitionState={isSaving ? "loading" : isError ? "error" : "default"}
  >
    Save
  </Savebar.ConfirmButton>
</Savebar>
<ExitFormDialog isOpen={guard.isBlocked} onClose={guard.keepEditing} onLeave={guard.leave} />
```

- Confirm stays visible but `disabled` until the form is dirty, matching Dashboard's
  `isSaveDisabled`. Don't hide the bar and don't swap the label to "Saving…" — pass
  `transitionState` and let the button render the spinner / checkmark.
- Guard navigation with `useUnsavedChangesGuard` + `ExitFormDialog`. **Never** use
  `window.confirm` or a `beforeunload` prompt: the Dashboard app iframe is sandboxed without
  `allow-modals`, so those are silently suppressed (and `confirm` returning `false` would block
  navigation outright). Navigation initiated by the app after a successful save must go through
  `guard.navigateWithoutGuard`.

**Field labels — required vs optional:** Dashboard does **not** mark required fields with an
asterisk. Required fields are a plain label; optional fields append secondary `(optional)` (or a
localized equivalent) after the label. Same idea as `DetailSettingsCardTitle optional` on card
titles — mark the exception, not the default.

```tsx
// ✅ Required — plain label, no asterisk
<label>Publishable key</label>

// ✅ Optional — secondary copy marks the exception
<label>Restricted key (optional)</label>

// ❌ Asterisk for required
<label>Publishable key *</label>
```

Helper-text hints under inputs stay muted (`default2`). Do not bold the field name in a hint when
it merely restates the label. Emphasis belongs on values the merchant must recognize while
pasting — key prefixes (`pk_test`, `rk_live`) and masked key tails.

### Configuration hubs vs entity detail

| Surface | Use |
| ------- | --- |
| App configuration / settings hubs | `SettingsPageContent` + `SettingsSection` (+ `ownership`) |
| Entity-style detail inside an app | `DetailSettingsCard` |

**Ownership:** mark every settings card with `ownership="shop"` (store-wide) or
`ownership="channel"` (per-channel). Shop chips use accent fill + Store icon; Channel
chips use neutral fill + Globe icon — same as Dashboard.

**Pill radius:** status / env labels (Sandbox, Live, currency) use full capsules
(`border-radius: 999px` / `9999px`, Dashboard `Pill` uses `32px`). Ownership chips stay
squarer (`borderRadius={2}`) — don’t mix the two.

**Pill padding:** prefer Geist/Vercel status-badge geometry — tight vertical, ~`10px`
horizontal (`padding: 0 10px`) so rounded caps don’t optically pinch the label.

`SettingsSection` description is capped at **75%** width so intro copy doesn’t
run under `headerEnd` actions.

Pick `ownership` from what the setting actually scopes, not from where it is stored:
credentials that only take effect once assigned to channels are `channel`.

```tsx
<SettingsPageContent description="Connect Stripe and assign configurations per channel.">
  <SettingsSection
    title="Email sender"
    ownership="shop"
    description="These settings apply store-wide (shop settings), not per channel."
    headerEnd={<Button size="small">Add</Button>}
  >
    <SettingsFieldStack>{/* … */}</SettingsFieldStack>
  </SettingsSection>
  <SettingsSection
    title="Stripe configurations"
    ownership="channel"
    description="Choose which configuration each sales channel uses."
  >
    <SettingsFieldStack>{/* … */}</SettingsFieldStack>
  </SettingsSection>
</SettingsPageContent>
```

For richer left-rail content (legends, how-to steps), pass `aside` **in addition to**
`description` — it stacks below the intro paragraph and keeps sticky behavior.

Prefer `AsideInfoCard` inside `aside` for bordered legends: flat body (title + always-visible
summary) and an optional fold footer for secondary how-tos.

```tsx
<SettingsPageContent
  description="Connect Stripe, then assign each configuration to its channels."
  aside={
    <AsideInfoCard
      title="Test vs live mode"
      fold={{
        title: "Get keys in Stripe Dashboard",
        children: <>{/* steps, scopes, links */}</>,
      }}
    >
      {/* mode swatches — always visible */}
    </AsideInfoCard>
  }
>
  {/* settings sections */}
</SettingsPageContent>
```

### `DetailSettingsCard`

Primary bordered settings surface on app configuration pages.

| Piece | Style |
| ----- | ----- |
| Card shell | `default1` body, 8px radius, 1px border |
| Primary header | Tinted `default2` band; title left, `headerEnd` right |
| Title | Always `Text size={5} fontWeight="bold" as="h2"` — owned by the card |
| Header with action | Coerces macaw `Button` in `headerEnd` to `size="small"` |
| Leading copy | `intro` prop — white band + bottom border below header |
| Optional in title | `DetailSettingsCardTitle optional` + localized `optionalLabel` |
| Body | Padded content; `contentFlush` for lists |

```tsx
import { DetailSettingsCard, DetailSettingsCardTitle } from "@saleor/apps-ui-next";

<DetailSettingsCard
  title="Stripe configurations"
  subtitle="2 configurations"
  intro="Connect your Stripe account keys."
  headerEnd={<Button>Add</Button>}
>
  {/* … */}
</DetailSettingsCard>
```

### `DetailGroupBox`

Foldable section — Dashboard SEO / metadata pattern.

| Variant | Use |
| ------- | --- |
| `flush` | Full-bleed fold **inside** a parent card (no own border). Prefer this to avoid stacked boxes. |
| `secondary` | Standalone white-header card (SEO-like) |
| `primary` | Tinted header nested rows |
| `card` | Top-level foldable that *is* the card |

Header title: for standalone `secondary`/`primary` use `Text size={4} fontWeight="medium"` (Dashboard `Title2`). For `flush` footers inside a card, use normal body text (`Text size={2}`). Starts collapsed unless `defaultExpanded`.

For `flush`, render as a **direct** `SettingsSection` body sibling of the padded content so `.body > * + *` draws one top separator:

```tsx
<SettingsSection title="Stripe configurations" ownership="channel">
  <Box paddingX={6} paddingY={5}>{/* cards grid */}</Box>
  <DetailGroupBox
    groupId="unassigned-channels"
    variant="flush"
    marginTop={0}
    headerStart={<Text size={2}>2 channels not assigned</Text>}
  >
    {/* full-bleed channel rows */}
  </DetailGroupBox>
</SettingsSection>
```

### `SetupChecklist`

Guided setup card with required tasks, expandable details, review rows, and footer.

When the merchant dismisses the checklist, **park** it with `ParkedSetupChecklist` in the
main settings column (same slot as the full card) — do not restore via page-header buttons
or cog icons.

```tsx
import { SetupChecklist, ParkedSetupChecklist, setupChecklistStyles } from "@saleor/apps-ui-next";
import clsx from "clsx";

{!dismissed ? (
  <SetupChecklist
    className={clsx(setupChecklistStyles.elevated, theme === "defaultDark" && setupChecklistStyles.elevatedDark)}
    title="Finish Stripe setup"
    progress={{ done: 1, total: 3 }}
    tasksSection={{ title: "Required" }}
    tasks={[
      {
        id: "keys",
        title: "Add Stripe configuration",
        description: "Publishable and restricted keys",
        status: "completed",
      },
      {
        id: "map",
        title: "Map to a channel",
        description: "Choose which channel uses this config",
        status: "active",
        details: "Each Saleor channel maps to one Stripe configuration.",
        action: <Button>Map channel</Button>,
      },
    ]}
    nextUp="Next up: Map to a channel"
    footerActions={<Button variant="tertiary" size="small" onClick={dismiss}>Dismiss</Button>}
  />
) : (
  <ParkedSetupChecklist
    title="Finish Stripe setup"
    progress={{ done: 1, total: 3 }}
    nextUp="Next up: Map to a channel"
    onReveal={restore}
  />
)}
```

`ParkedSetupChecklist`: compact bordered row — progress pill (`1/3`), title, optional next-up
line, chevron. Click reveals the full checklist.

Task statuses: `pending` | `active` | `locked` | `completed` | `optional`.
Use `setupChecklistStyles.elevated` for floating emphasis (never combine with a CSS `border`).

### Typography and heading ownership

- Prefer macaw `Text` tokens (`size`, `fontWeight`, `color`) over browser
  defaults or ad-hoc `font-size`.
- **Section card titles:** always `Text size={5} fontWeight="bold" as="h2"` —
  owned by `DetailSettingsCard`. Pass title _content_ only.
- One visual system for the same role across apps — if a title looks off, fix
  the shared primitive, not a one-off page style.

### Interactive affordances

Every clickable control must show a hover (and focus-visible) state. Prefer:

| Pattern | When |
| ------- | ---- |
| Underline on hover | Text links |
| Color change on hover | Icon buttons, chips, rows |
| Both | Dense lists where underline alone is easy to miss |

Do **not** ship interactive elements that only change the cursor. Focus-visible
outlines stay required for keyboard users.

### Empty assignable lists (`EmptyAssignCallout`)

When a list inside a bordered card has **no items**, use the Dashboard dashed
empty callout — not plain muted text:

```tsx
import { EmptyAssignCallout, iconSize, iconStrokeWidthBySize } from "@saleor/apps-ui-next";
import { Globe } from "lucide-react";

<EmptyAssignCallout
  icon={<Globe size={iconSize.small} strokeWidth={iconStrokeWidthBySize.small} />}
  title="No channels assigned"
  description="Assign a channel to enable Stripe at checkout."
  action={
    <Button variant="secondary" size="small" onClick={onAssign}>
      Assign
    </Button>
  }
/>
```

### Full-bleed list rows

Lists **inside bordered cards** are full-bleed: row dividers and hover hit areas
reach the card edges. Put horizontal padding on the **row**
(`padding: var(--mu-spacing-1) var(--mu-spacing-4)`), not on the list wrapper.
See Dashboard `AssignListCard` and `ChannelListItem`.

### Buttons and icons (`IconButton`, `iconSize`)

Macaw `Button` is the control; apps were missing shared sizing conventions.
Use Dashboard tokens from `@saleor/apps-ui-next`:

| Token | Values |
| ----- | ------ |
| `iconSize` | `small` 16 · `medium` 20 · `large` 24 |
| `iconStrokeWidthBySize` | `small` 2 · `medium`/`large` 1.5 |

```tsx
import { IconButton, iconSize, iconStrokeWidthBySize } from "@saleor/apps-ui-next";
import { Plug, Trash2, Unplug } from "lucide-react";

// Icon-only row action (hover-revealed disconnect)
<IconButton
  aria-label="Disconnect channel"
  icon={<Unplug size={iconSize.small} strokeWidth={iconStrokeWidthBySize.small} />}
  onClick={onDisconnect}
/>

// Labeled secondary (assign / connect)
<Button
  variant="secondary"
  size="small"
  icon={<Plug size={iconSize.small} strokeWidth={iconStrokeWidthBySize.small} />}
>
  Assign channels
</Button>
```

**Icon meaning:** `Plug` / `Unplug` (or Link2 / Unlink2) for connect/disconnect.
Reserve `Trash2` for destroying the parent entity (e.g. delete configuration).

### Text links (`TextLink` from `@saleor/apps-ui`)

| Rule | Detail |
| ---- | ------ |
| Color | Primary text (`default1`) by default — **do not** use blue/`info1`/`accent1` unless explicitly requested as an exemption |
| Hover | Underline (`text-decoration`); no color change required |
| Size | **Inline links must match surrounding copy** — omit `size` so typography inherits. Pass `size` only for standalone links (e.g. header actions) |
| External (`newTab`) | Append Lucide `ExternalLink` at `1em` so the icon matches the link text size |
| Exemption | Pass `color` only when product asks for emphasis (rare) |

```tsx
// ✅ Inline in sized description — inherits parent Text size
<Text size={2} color="default2">
  See the <TextLink href="https://docs.saleor.io/..." newTab>configuration docs</TextLink>.
</Text>

// ✅ Standalone link with explicit size
<TextLink href="https://docs.saleor.io/..." newTab size={2}>
  Documentation
</TextLink>

// ❌ Blue marketing-style link in product chrome
<Text color="info1" as="a" href="...">docs</Text>
```

## Elevated surfaces

Apps are mostly **flat bordered surfaces** (`DetailSettingsCard`). Use **shadow
elevation only when the UI truly floats** — modals, popovers, menus, and rare
emphasis (e.g. `SetupChecklist`).

### The rule

Never put `border` and `box-shadow` on the same elevated node (double edge).
Bake a 1px hairline into the final shadow layer instead:

```css
.elevated {
  border: none;
  --smooth-ring-color: rgba(0, 0, 0, 0.05);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.06),
    0 0 0 1px var(--smooth-ring-color);
}

.elevatedDark {
  --smooth-ring-color: rgba(255, 255, 255, 0.18);
}
```

| Surface | Treatment |
| ------- | --------- |
| `DetailSettingsCard` | Flat — `border: 1px solid var(--mu-colors-border-default1)`, no shadow |
| Macaw `Modal` / `Popover` | Prefer macaw primitives |
| `SetupChecklist` emphasis | Elevated — smooth-shadow-ring pattern above |

Upstream pattern credit: [shadow-plugin](https://github.com/flornkm/shadow-plugin)
/ [shadow.floriankiem.com](https://shadow.floriankiem.com/).

## i18n

Shared components accept `ReactNode` for merchant-facing copy. Do not depend on
`react-intl` inside `@saleor/apps-ui-next`. Callers own strings and localization.

## Vendoring from Dashboard

When porting a component from `saleor-dashboard`:

1. Add `SOURCE.md` in the component directory with upstream path, commit SHA, and
   intentional divergences (see ADR 0004).
2. Replace `@saleor/macaw-ui-next` imports with `@saleor/macaw-ui`.
3. Strip `FormattedMessage` / `@dashboard/*` helpers; expose `ReactNode` props.
4. Keep CSS modules and `--mu-*` tokens; do not rewrite tokens if the catalogs
   still match.

## Anti-patterns

- **No asterisks on required fields** — mark optional fields with secondary `(optional)` instead
- **No inline `style={{}}`** — use Box props or CSS Modules
- **No plain `.css` files** for components — use `.module.css`
- **No hardcoded colors** — use `var(--mu-colors-*)` or Box color props
- **No shared CSS modules** — one `.module.css` per component
- **No `border` + `box-shadow`** on elevated surfaces
- **No legacy Macaw 0.7.x**
- **No new components in `@saleor/apps-ui`** — use `@saleor/apps-ui-next`
- **No responsive objects on `padding*` / `margin*` / `gap`** — use CSS media queries
- Combining Box + CSS Modules in one component is fine (Box for layout, module for complexity)
