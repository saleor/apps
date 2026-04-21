#!/usr/bin/env -S node --experimental-strip-types --disable-warning=ExperimentalWarning
/**
 * List old Vercel deployments for every app in this monorepo and print the
 * `vercel remove` command(s) needed to delete them. The script itself does
 * NOT mutate anything — paste the printed commands into your terminal to
 * actually remove the deployments.
 *
 * Each app under `apps/*` is a separate Vercel project whose project name
 * matches the `name` field in `apps/<app>/package.json`.
 *
 * Deletion is done manually so you can review and let `vercel remove`
 * handle the "still serving traffic" check interactively via its `--safe`
 * flag. `--safe` skips deployments that currently have an active alias —
 * the live production deployment plus any aliased preview.
 *
 * Required env vars:
 *   VERCEL_TEAM_SLUG  - Vercel team slug (passed as `-S` to the CLI)
 *
 * Usage:
 *   node --experimental-strip-types scripts/remove-old-vercel-deployments.ts
 *   node --experimental-strip-types scripts/remove-old-vercel-deployments.ts --app=stripe
 *   node --experimental-strip-types scripts/remove-old-vercel-deployments.ts --max-age-days=14
 */
import { execFile } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, promisify } from "node:util";

const execFileP = promisify(execFile);

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const appsDir = join(repoRoot, "apps");

const { values } = parseArgs({
  options: {
    "max-age-days": { type: "string", default: "7" },
    app: { type: "string" },
    "with-aliases": { type: "boolean", default: false },
  },
});

const maxAgeDays = Number(values["max-age-days"]);
const singleApp = values.app;
const withAliases = values["with-aliases"] ?? false;

const teamSlug = process.env.VERCEL_TEAM_SLUG;

if (!teamSlug) {
  console.error("VERCEL_TEAM_SLUG not set");
  process.exit(1);
}
if (!Number.isFinite(maxAgeDays) || maxAgeDays <= 0) {
  console.error("--max-age-days must be a positive number");
  process.exit(1);
}

const cutoffMs = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

const IDS_PER_COMMAND = 50;

type Deployment = {
  uid: string;
  url?: string;
  created: number;
  target?: string | null;
  aliasAssigned?: number | boolean | null;
  readySubstate?: string;
  isRollbackCandidate?: boolean | null;
  customEnvironment?: { slug?: string };
};

type DeploymentsResponse = {
  deployments?: Deployment[];
};

type Alias = {
  alias: string;
  deploymentId: string;
  deletedAt?: number | null;
};

type AliasesResponse = {
  aliases?: Alias[];
  pagination?: { next?: number | null };
};

async function fetchAliasesByDeployment(): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  let next: number | undefined;
  let pages = 0;

  while (true) {
    const params = new URLSearchParams({ limit: "100" });
    if (next !== undefined) params.set("until", String(next));
    const res = await vercelApi<AliasesResponse>(`/v4/aliases?${params.toString()}`);
    const page = res.aliases ?? [];
    pages++;
    for (const a of page) {
      if (a.deletedAt) continue;
      const existing = map.get(a.deploymentId);
      if (existing) existing.push(a.alias);
      else map.set(a.deploymentId, [a.alias]);
    }
    const n = res.pagination?.next;
    if (typeof n !== "number" || n === next) break;
    next = n;
  }

  console.error(`Fetched aliases: ${map.size} deployment(s) aliased across ${pages} page(s).`);
  return map;
}

async function vercelApi<T>(path: string): Promise<T> {
  const { stdout } = await execFileP("vercel", ["api", path, "-S", teamSlug!]);
  return JSON.parse(stdout) as T;
}

async function readProjectNames(): Promise<string[]> {
  const entries = singleApp ? [singleApp] : await readdir(appsDir);
  const names: string[] = [];

  for (const entry of entries) {
    const pkgPath = join(appsDir, entry, "package.json");
    try {
      const pkg = JSON.parse(await readFile(pkgPath, "utf8")) as { name?: string };
      if (pkg.name) {
        names.push(pkg.name);
      } else {
        console.warn(`skip apps/${entry}: package.json has no name`);
      }
    } catch {
      console.warn(`skip apps/${entry}: cannot read package.json`);
    }
  }

  return names;
}

async function listOldDeployments(projectName: string): Promise<Deployment[]> {
  const all: Deployment[] = [];
  let until = cutoffMs;

  while (true) {
    const params = new URLSearchParams({
      projectId: projectName,
      until: String(until),
      limit: "100",
    });
    const res = await vercelApi<DeploymentsResponse>(`/v6/deployments?${params.toString()}`);
    const page = res.deployments ?? [];
    if (page.length === 0) break;

    all.push(...page);

    const oldest = page[page.length - 1]?.created;
    if (typeof oldest !== "number" || oldest === until) break;
    until = oldest;
  }

  return all;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function formatTimestamp(ms: number | boolean | null | undefined): string {
  if (typeof ms !== "number") return "-";
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");
}

function pad(s: string, width: number): string {
  return s.length >= width ? s : s + " ".repeat(width - s.length);
}

function printProjectBlock(
  projectName: string,
  deployments: Deployment[],
  aliasMap: Map<string, string[]> | null,
) {
  console.log(`\n# ${projectName} — ${deployments.length} deployment(s) older than ${maxAgeDays}d`);
  console.log(
    "#   " +
    pad("uid", 36) +
    "  " +
    pad("created", 20) +
    "  " +
    pad("target", 10) +
    "  " +
    pad("aliasAssigned", 20) +
    "  " +
    pad("substate", 10) +
    "  " +
    pad("rb", 2) +
    "  " +
    pad("customEnv", 15) +
    "  url",
  );
  console.log(
    "#   " +
    "-".repeat(36) +
    "  " +
    "-".repeat(20) +
    "  " +
    "-".repeat(10) +
    "  " +
    "-".repeat(20) +
    "  " +
    "-".repeat(10) +
    "  " +
    "-".repeat(2) +
    "  " +
    "-".repeat(15) +
    "  ---",
  );
  for (const d of deployments) {
    const aliases = aliasMap?.get(d.uid) ?? [];
    const aliasSuffix = aliasMap
      ? aliases.length > 0
        ? `   aliases: ${aliases.join(", ")}`
        : "   aliases: -"
      : "";
    console.log(
      "#   " +
      pad(d.uid, 36) +
      "  " +
      pad(formatTimestamp(d.created), 20) +
      "  " +
      pad(d.target ?? "preview", 10) +
      "  " +
      pad(formatTimestamp(d.aliasAssigned), 20) +
      "  " +
      pad(d.readySubstate ?? "-", 10) +
      "  " +
      pad(d.isRollbackCandidate ? "Y" : "-", 2) +
      "  " +
      pad(d.customEnvironment?.slug ?? "-", 15) +
      "  " +
      (d.url ?? "-") +
      aliasSuffix,
    );
  }
  console.log(
    "# Review the list above. `--safe` will server-side skip any deployment",
  );
  console.log("# that still has an active alias at the moment `vercel remove` runs.");
  const ids = deployments.map((d) => d.uid);
  for (const part of chunk(ids, IDS_PER_COMMAND)) {
    console.log(`vercel remove ${part.join(" ")} --safe --yes -S ${teamSlug}`);
  }
}

async function main() {
  const projects = await readProjectNames();
  console.error(
    `Scanning ${projects.length} project(s). Cutoff: ${new Date(cutoffMs).toISOString()}. with-aliases=${withAliases}`,
  );

  const aliasMap = withAliases ? await fetchAliasesByDeployment() : null;

  let total = 0;
  const failures: string[] = [];

  for (const project of projects) {
    try {
      const deployments = await listOldDeployments(project);
      if (deployments.length === 0) {
        console.error(`${project}: nothing to remove`);
        continue;
      }
      printProjectBlock(project, deployments, aliasMap);
      total += deployments.length;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`${project}: ${msg}`);
      failures.push(project);
    }
  }

  console.error(
    `\nFound ${total} deployment(s) to remove across ${projects.length} project(s).`,
  );
  console.error(`Run the 'vercel remove' commands above to delete them.`);

  if (failures.length > 0) {
    console.error(`Failures: ${failures.join(", ")}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
