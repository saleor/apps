# Scripts

Maintenance scripts for the saleor-apps monorepo.

## `remove-old-vercel-deployments.ts`

Lists Vercel deployments older than N days across every app in this repo and
prints the `vercel remove ... --safe --yes` command(s) to delete them.
**The script does not mutate anything.** Copy the printed commands and run
them manually — that way the Vercel CLI handles the "still serving traffic"
check interactively via its `--safe` flag (keeps the live production
deployment plus any aliased preview).

### Prerequisites

- Node 22.6+ (for native TypeScript type stripping — `--experimental-strip-types`)
- Vercel CLI installed and logged in: `npm i -g vercel && vercel login`

Authentication reuses the token stored by `vercel login`. No API token is read
from the environment and none is committed to the repo.

### Required environment variables

| Var | What |
| --- | --- |
| `VERCEL_TEAM_SLUG` | Slug of the Vercel team that owns the projects. Passed to the CLI as `-S`. |


### Usage

Node runs the TypeScript directly — no build step, no tsx dependency.

```bash
# List old deployments for every app (default: older than 7 days)
VERCEL_TEAM_SLUG=... \
  pnpm remove-old-vercel-deployments

# Only one app
pnpm remove-old-vercel-deployments --app=stripe

# Custom age threshold
pnpm remove-old-vercel-deployments --max-age-days=14
```

The script writes progress and summary to stderr and the `vercel remove`
commands to stdout, so you can pipe stdout to a file or `sh` once reviewed:

```bash
VERCEL_TEAM_SLUG=... \
  pnpm remove-old-vercel-deployments > remove.sh
# review remove.sh, then:
sh remove.sh
```

### How it works

1. Reads `apps/*/package.json` and takes the `name` field as the Vercel
   project name. Every app in this repo already follows this convention.
2. Calls `vercel api /v6/deployments?projectId=<name>&until=<cutoff>` to page
   through deployments older than the cutoff. The CLI injects the bearer
   token from `vercel login`, so no token plumbing is needed.
3. Prints a per-project table (as `#`-prefixed shell comments) with each
   deployment's `uid`, `created`, `target`, `aliasAssigned` timestamp, and
   `url` so you can sanity-check before running anything.
4. Prints one or more `vercel remove <ids> --safe --yes -S <team>` commands
   (chunked at 50 IDs per command to stay under shell arg limits). You run
   them manually. `--safe` performs the "still serving traffic" check
   server-side at delete time, so an alias that moves between listing and
   deletion will not cause an in-use deployment to be removed.

Because the preview table is emitted as shell comments, piping output to a
file (`> remove.sh`) yields a script where `sh remove.sh` runs only the
`vercel remove` lines and ignores the annotations.

### Flags

| Flag | Default | What |
| --- | --- | --- |
| `--max-age-days=<n>` | `7` | Consider deployments older than this many days. |
| `--app=<dirname>` | all | Limit to a single app directory under `apps/`. |

