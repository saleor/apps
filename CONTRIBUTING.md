# Contributing

Thanks for your interest in Saleor Apps. Please read this first — how code lands here is not the usual GitHub flow.

## This repository is a mirror

Development happens in a private repository owned by Saleor, which is the source of truth. This repository is a **one-way mirror** of the parts of it we publish.

What follows from that:

- Every commit here is a squashed snapshot pushed by a sync bot, not the original commit from the canonical repository. `git log` shows sync commits, not a PR-by-PR history — the per-app `CHANGELOG.md` files carry the narrative.
- History here is always fast-forward. Nothing is ever force-pushed.
- Not everything in the canonical repository is published here. Some apps are not open source, so their code and their release tags never appear.
- Pull requests opened here are **never merged with the merge button**. The sync would overwrite them on the next push, and only the sync bot can write to `main`.

## We still accept pull requests

"Not merged" is not "not accepted." The review is real, and this is what acceptance looks like:

1. You open a PR here. A maintainer reviews it exactly as they would review an internal one.
2. If we accept it, a maintainer copies the change into the private repository, where it goes through the normal review and CI.
3. It reaches this repository on the next sync, and we close your PR with a link to the commit that carries your change.

Because the change arrives here as part of a squashed sync commit, git will not show you as the author. We are aware this is a real cost of the setup — we credit contributors in the changeset that becomes the public changelog entry, and in the closing comment on your PR. By opening a PR you agree to your contribution being released under this repository's [BSD-3-Clause license](./LICENSE).

## Before you open a PR

- **Open an issue or a [discussion](https://github.com/saleor/apps/discussions) first** for anything beyond a bug fix or a typo. This monorepo hosts the apps Saleor runs in its own infrastructure, so the roadmap is driven by that; agreeing on the shape of a change up front saves you from writing code we cannot take.
- Look at issues labelled [`good first issue`](https://github.com/saleor/apps/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22+) and [`help wanted`](https://github.com/saleor/apps/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22).
- Read the general [Saleor contribution guidelines](https://docs.saleor.io/developer/community/contributing).

## Working on a change

See the [README](./README.md) for setup, and [`AGENTS.md`](./AGENTS.md) for the conventions this codebase follows (module layout, `neverthrow` result handling, branded types, error classes).

- Keep a PR scoped to one app or package.
- `pnpm lint`, `pnpm check-types` and `pnpm test:ci` should pass.

## Reporting bugs

Open a [bug report](https://github.com/saleor/apps/issues/new/choose).

## Reporting security issues

Do **not** open a public issue. Follow the [Saleor security policy](https://github.com/saleor/apps/security/policy) instead.
