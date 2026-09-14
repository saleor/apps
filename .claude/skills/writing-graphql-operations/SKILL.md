---
name: writing-graphql-operations
description: >
  Use when writing or editing GraphQL operations (queries, mutations, fragments,
  webhook subscriptions) in a Saleor app — adding a .graphql file, adding fields
  to an existing one, or regenerating types.
---

# Writing GraphQL operations

Operations live in `apps/<app>/graphql/` as `.graphql` files, one operation per
file, kebab-case name matching the operation:

```
apps/<app>/graphql/
  fragments/config-channel.graphql
  queries/fetch-channels.graphql
  mutations/transaction-event-report.graphql
  subscriptions/transaction-charge-requested.graphql   # webhook payloads
```

Types are generated into `apps/<app>/generated/graphql.ts` by codegen
(`graphql.config.ts` or `codegen.ts`). Never hand-edit generated files.

## Never use deprecated fields

The app's `graphql/schema.graphql` is the source of truth. Before using a field,
argument, enum value or input field, grep for it there and check for
`@deprecated`:

```bash
grep -n "myField" apps/<app>/graphql/schema.graphql
```

```graphql
orderSettings: OrderSettings @deprecated(reason: "Use the `channel` query to fetch the `orderSettings` field instead.")
```

If it's deprecated, use the replacement named in the `reason`. If the `reason`
doesn't name a replacement, or it's unclear which of several alternatives fits,
ask the user instead of guessing. Deprecated fields
get removed in later Saleor versions and will break the app for merchants on
newer cores. This applies to editing existing operations too — if you touch a
selection set that already selects a deprecated field, replace it.

## Workflow

1. Add or edit the `.graphql` file under `apps/<app>/graphql/`.
2. Check every new field against `graphql/schema.graphql` for `@deprecated`.
3. Run `pnpm --filter <package-name> generate` (some apps also have
   `generate:app` / `generate:e2e`).
4. Import the generated `*Document` from `@/generated/graphql` and use it with
   the urql client.

## Selection sets

Select only fields the app actually uses — every field is work for Saleor core
and a compatibility risk. Extract a fragment when the same selection is used by
more than one operation.
