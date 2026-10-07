---
name: writing-changesets
description: Use when adding a changeset, writing changelog or release notes, or when a functional change (feature, fix) is ready to commit.
---

# Writing a changeset

Read `.changeset/README.md` first — its writing rules apply.

## When

- Add one for changes users can notice: features, fixes, behavior changes, removed or deprecated functionality.
- Skip for refactors, tests, CI, internal tooling and dependency bumps with no visible effect.
- One changeset per distinct change. Several unrelated changes in one PR → several changesets.

## How

Create `.changeset/<short-kebab-name>.md` (or run `pnpm changeset add` from the root):

```md
---
"saleor-app-payment-stripe": patch
---

<description>
```

Use the package `name` from the app's `package.json`. Bump: `patch` for fixes, `minor` for new features, `major` for breaking changes.

## What to write

Focus on the **functional change and its rationale**: what the user can now do, or what no longer goes wrong, and why it matters.

- Never disclose private information: client, merchant or partner names, store domains, customer data, internal contacts or deal details — even if they appear in the original discussion or issue. Changelogs are public.
- Describe behavior, not code. No class, function, file, module or library names unless the user configures them directly.
- Do not describe UI (buttons, layouts, colors, copy). Describe what the user can achieve.
- Include before/after when it makes the change clearer: "Before, X happened when Y. Now Z."
- Mention required actions (reconfiguration, permissions, minimum Saleor version) and known limitations.
- One to three sentences is usually enough.

Bad:

> Refactored `TransactionEventReporter` to pass `paymentMethodDetails` in the `transactionEventReport` mutation and added a new toggle to the settings card.

Good:

> Transactions created on Saleor 3.23 and newer now include payment method details (card brand, last digits). Before, these were missing, so staff could not see how an order was paid.
