---
name: writing-pr-description
description: Use when asked to create a pull request, write a PR description, or update/rewrite an existing PR description.
---

# Writing a PR description

## 1. Gather context

- Diff against the base: `git diff origin/main...HEAD` and `git log origin/main..HEAD`.
- Existing PR, if any: `gh pr view --json title,body,commits`.
- The conversation: user prompts, linked issues (Linear, Sentry, GitHub) and decisions made along the way.

## 2. Resolve the problem

Combine commits and prompts into one statement: **what problem does this PR solve, and why now?** Commits describe steps; the description describes the outcome. Drop dead ends, reverted attempts and fixup commits.

If you cannot say the problem in one or two sentences, ask the user before writing.

## 3. Structure

Fill `.github/PULL_REQUEST_TEMPLATE.md`. Inside "Scope of the PR", go from general to specific:

1. **Problem** — what is broken or missing, who is affected. Link the issue/Sentry event.
2. **Solution** — the approach in plain words, one short paragraph.
3. **Before / After** — what a reviewer would observe at a high level (behavior, API response, log, config, UI flow). Use a short list or a two-column table. Skip only if there is no observable difference (pure refactor) and say so.
4. **Implementation details** — the non-obvious parts: where the change lives, trade-offs, rejected alternatives, migrations, risky spots worth reviewing. Group by area, not by commit.
5. **Checks run** — commands actually run and their result (tests, types, lint, manual testing). Never claim a check you did not run.

Then fill "Related issues" and the changeset checkbox. If there is no changeset, say why (see the `writing-changesets` skill).

## Rules

- Never disclose private information: client, merchant or partner names, store domains, customer data, internal contacts, credentials or deal details — even if they appear in prompts, issues or Sentry events. Describe the case generically ("a merchant with 10k variants").
- The reviewer reads top-down and may stop early: the first paragraph must explain the PR alone.
- Do not list files changed or restate the diff line by line — GitHub shows that.
- Prefer concrete examples (input → output, error message, payload) over adjectives.
- When updating an existing description, keep content the user wrote by hand unless it is now wrong.
- Use `gh pr create --base main --body-file …` / `gh pr edit --body-file …`. Do not push or create the PR unless asked.
