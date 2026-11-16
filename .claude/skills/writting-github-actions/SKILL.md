---
name: writing-github-actions
description: Use when creating, editing, reviewing, or validating GitHub Actions workflows, including pull-request triggers, concurrency, action pinning, and workflow security checks.
---

# Writing GitHub Actions workflows

## Push triggers

Never use an unconditional `push:` trigger. Scope push-triggered workflows to `main`:

```yaml
on:
  push:
    branches: [main]
```

Use a `pull_request` trigger instead when the workflow is intended to validate pull
requests rather than changes already merged to `main`.

## Pull-request gate

For every workflow with an active `pull_request` trigger, make CI run for a draft PR only
when it has the `run-ci` label. Add both `labeled` and `ready_for_review` to the trigger
types, then apply the guard to every job that should not run for an unlabelled draft.
Use a folded scalar for readable conditions:

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review, labeled]

jobs:
  check:
    if: >-
      ${{ github.event_name != 'pull_request' || !github.event.pull_request.draft ||
      contains(github.event.pull_request.labels.*.name, 'run-ci') }}
```

For workflows that also have non-PR triggers, retain the `github.event_name` clause so
push, schedule, dispatch, and reusable-workflow runs are unaffected. Combine this guard
with every pre-existing job condition using `&&`; preserve that condition's behavior.

Do not add this gate to these deliberately quick PR workflows:

- `.github/workflows/assign-pr.yml`
- `.github/workflows/labeler.yml`

## Concurrency

Every workflow with an active `pull_request` trigger needs a root-level concurrency group
that collapses runs for the same PR and cancels the run it supersedes:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true
```

Preserve an existing equivalent per-PR group. When the workflow also runs for non-PR
events, the `github.ref` fallback keeps those runs isolated.

## Action references

Use `$pinact` whenever freezing a new GitHub Action or reusable workflow reference, and
whenever upgrading one. Read `.claude/skills/pinact/SKILL.md` before using its commands.
For upgrades, run `pinact run -u -m 21` and keep the 21-day cooldown; do not bypass it.

## Validation

After changing workflows, run `scripts/validate-worflows.sh` from this skill directory.
It runs `zizmor` and `actionlint` when they are available. When any of `zizmor`,
`actionlint`, or `shellcheck` is missing, warn the user explicitly and suggest installing
it (for example, `brew install zizmor actionlint shellcheck`). `shellcheck` is needed for
actionlint's shell-script analysis. Resolve reported findings or state why a finding is
intentionally accepted.
