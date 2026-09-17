/**
 * Reports app GraphQL documents that break, or rely on deprecated fields, on each
 * Saleor version the app declares support for.
 *
 * Supported versions live in `saleor-versions.json`; each app declares its range in
 * its own `package.json` under `saleor.requiredVersion`. Combinations outside an
 * app's range are skipped, so an app capped at `<3.24` is never checked against it.
 *
 * Findings never fail the run. Apps deliberately author documents against the newest
 * supported schema and degrade at runtime, so errors on older versions are expected.
 * The run fails only when the check itself cannot be trusted - an unreachable schema
 * ref, an unreadable config, or a document that cannot be parsed.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CodeFileLoader } from "@graphql-tools/code-file-loader";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadDocuments } from "@graphql-tools/load";
import {
  buildSchema,
  concatAST,
  type DocumentNode,
  type GraphQLError,
  type GraphQLSchema,
  NoDeprecatedCustomRule,
  NoUnusedFragmentsRule,
  specifiedRules,
  validate,
} from "graphql";
import semver from "semver";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * An unused fragment is a hygiene problem, not a compatibility one, and it is the rule
 * most likely to fire spuriously when an app splits documents across files.
 */
const compatibilityRules = specifiedRules.filter((rule) => rule !== NoUnusedFragmentsRule);

/** Globs used when an app's config declares no documents of its own. */
const fallbackDocumentGlobs = ["graphql/**/*.graphql", "src/**/*.ts", "src/**/*.tsx"];

const ignoredDocumentPaths = [
  "**/schema.graphql",
  "**/generated/**",
  "**/node_modules/**",
  "**/.next/**",
];

type SaleorVersion = { version: string; ref: string };
type Finding = { kind: "error" | "deprecation"; location: string; message: string };
type Result = { status: "skipped"; reason: string } | { status: "checked"; findings: Finding[] };

const readJson = (filePath: string) => JSON.parse(fs.readFileSync(filePath, "utf8"));

const loadVersions = (): SaleorVersion[] => {
  const { versions } = readJson(path.join(repoRoot, "saleor-versions.json"));

  if (!Array.isArray(versions) || versions.length === 0) {
    throw new Error("saleor-versions.json declares no versions");
  }

  for (const { version } of versions) {
    if (!semver.coerce(version)) {
      throw new Error(`saleor-versions.json declares "${version}", which is not a version`);
    }
  }

  return versions;
};

const fetchSchema = async ({ version, ref }: SaleorVersion): Promise<GraphQLSchema> => {
  const url = `https://raw.githubusercontent.com/saleor/saleor/${ref}/saleor/graphql/schema.graphql`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Cannot fetch schema for ${version} from ${url}: ${response.status}`);
  }

  return buildSchema(await response.text(), { assumeValidSDL: true });
};

/**
 * `documents` shows up in three shapes across the repo: at the top level of
 * `graphql.config.ts`, under `projects.<name>`, and under `generates.<file>` in
 * `codegen.ts`. Walking for the key handles all of them without encoding the nesting.
 */
const collectGlobs = (node: unknown, found: string[][] = []): string[][] => {
  if (node === null || typeof node !== "object") {
    return found;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === "documents" && Array.isArray(value)) {
      found.push(value.filter((entry): entry is string => typeof entry === "string"));
    } else {
      collectGlobs(value, found);
    }
  }

  return found;
};

/** One glob set per project - an app's `e2e` documents are loaded separately from its own. */
const readProjectGlobs = async (appDir: string): Promise<string[][]> => {
  const projects: string[][] = [];

  for (const configName of ["graphql.config.ts", "codegen.ts"]) {
    const configPath = path.join(appDir, configName);

    if (!fs.existsSync(configPath)) {
      continue;
    }

    projects.push(...collectGlobs((await import(configPath)).default));
  }

  return projects.length > 0 ? projects : [fallbackDocumentGlobs];
};

const loadProjectDocument = async (
  appDir: string,
  globs: string[],
): Promise<DocumentNode | null> => {
  let sources;

  try {
    sources = await loadDocuments(globs, {
      cwd: appDir,
      loaders: [new GraphQLFileLoader(), new CodeFileLoader()],
      ignore: ignoredDocumentPaths,
      noSilentErrors: true,
    });
  } catch (error) {
    /**
     * An app with no operations at all (or a project whose globs match nothing) is a
     * legitimate state. Anything else - most likely a document that cannot be parsed -
     * means the check cannot be trusted, so it is left to fail the run.
     */
    if (error instanceof Error && error.message.includes("Unable to find any GraphQL")) {
      return null;
    }

    throw error;
  }

  const documents = sources.flatMap((source) => (source.document ? [source.document] : []));

  return documents.length > 0 ? concatAST(documents) : null;
};

const describeLocation = (error: GraphQLError): string => {
  const source = error.nodes?.[0]?.loc?.source.name;
  const line = error.locations?.[0]?.line;

  if (!source || source === "GraphQL request") {
    return "unknown location";
  }

  const relative = path.relative(repoRoot, source);

  return line ? `${relative}:${line}` : relative;
};

const toFindings = (errors: readonly GraphQLError[], kind: Finding["kind"]): Finding[] =>
  errors.map((error) => ({
    kind,
    location: describeLocation(error),
    message: error.message,
  }));

const checkApp = (schema: GraphQLSchema, documents: DocumentNode[]): Finding[] =>
  documents.flatMap((document) => [
    ...toFindings(validate(schema, document, compatibilityRules), "error"),
    ...toFindings(validate(schema, document, [NoDeprecatedCustomRule]), "deprecation"),
  ]);

const main = async () => {
  const versions = loadVersions();
  const schemas = new Map<string, GraphQLSchema>();

  for (const version of versions) {
    schemas.set(version.version, await fetchSchema(version));
  }

  const appsDir = path.join(repoRoot, "apps");
  const apps = fs.readdirSync(appsDir).sort();
  const results = new Map<string, Map<string, Result>>();

  for (const app of apps) {
    const appDir = path.join(appsDir, app);
    const { saleor } = readJson(path.join(appDir, "package.json"));
    const requiredVersion: string | undefined = saleor?.requiredVersion;

    const documents: DocumentNode[] = [];

    for (const globs of await readProjectGlobs(appDir)) {
      const document = await loadProjectDocument(appDir, globs);

      if (document) {
        documents.push(document);
      }
    }

    if (documents.length === 0) {
      continue;
    }

    const perVersion = new Map<string, Result>();

    for (const { version } of versions) {
      const supported =
        !requiredVersion || semver.satisfies(semver.coerce(version)!, requiredVersion);

      perVersion.set(
        version,
        supported
          ? { status: "checked", findings: checkApp(schemas.get(version)!, documents) }
          : { status: "skipped", reason: `requires ${requiredVersion}` },
      );
    }

    results.set(app, perVersion);
  }

  return report(versions, results);
};

const report = (versions: SaleorVersion[], results: Map<string, Map<string, Result>>) => {
  const lines: string[] = ["## GraphQL schema compatibility", ""];
  const summarize = (result: Result) => {
    if (result.status === "skipped") {
      return `skipped (${result.reason})`;
    }

    const errors = result.findings.filter((finding) => finding.kind === "error").length;
    const deprecations = result.findings.length - errors;

    if (errors === 0 && deprecations === 0) {
      return "clean";
    }

    return [errors && `${errors} error(s)`, deprecations && `${deprecations} deprecated`]
      .filter(Boolean)
      .join(", ");
  };

  lines.push(`| App | ${versions.map((v) => v.version).join(" | ")} |`);
  lines.push(`|---|${versions.map(() => "---").join("|")}|`);

  for (const [app, perVersion] of results) {
    const cells = versions.map((v) => summarize(perVersion.get(v.version)!));

    lines.push(`| ${app} | ${cells.join(" | ")} |`);
  }

  let findingCount = 0;

  for (const [app, perVersion] of results) {
    /**
     * The same deprecation usually fires on every version, so findings are listed once
     * and tagged with the versions they affect. That keeps a PR comment readable and
     * makes "3.22 only" stand out from "all versions".
     */
    const byFinding = new Map<string, { finding: Finding; versions: string[] }>();

    for (const { version } of versions) {
      const result = perVersion.get(version)!;

      if (result.status === "skipped") {
        continue;
      }

      for (const finding of result.findings) {
        findingCount += 1;

        const key = `${finding.kind}|${finding.location}|${finding.message}`;
        const entry = byFinding.get(key) ?? { finding, versions: [] };

        entry.versions.push(version);
        byFinding.set(key, entry);
      }
    }

    if (byFinding.size === 0) {
      continue;
    }

    lines.push("", `### ${app}`, "");

    for (const kind of ["error", "deprecation"] as const) {
      const entries = [...byFinding.values()].filter(({ finding }) => finding.kind === kind);

      if (entries.length === 0) {
        continue;
      }

      lines.push(kind === "error" ? "**Errors**" : "**Deprecated fields**", "");
      entries.forEach(({ finding, versions: affected }) =>
        lines.push(`- \`${finding.location}\` — ${finding.message} _(${affected.join(", ")})_`),
      );
      lines.push("");
    }
  }

  if (findingCount === 0) {
    lines.push("", `No findings across ${results.size} apps and ${versions.length} versions.`);
  }

  const markdown = lines.join("\n");

  console.log(markdown);

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
  }

  if (process.env.SCHEMA_REPORT_PATH) {
    fs.writeFileSync(process.env.SCHEMA_REPORT_PATH, `${markdown}\n`);
  }

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `findings=${findingCount}\n`);
  }

  return findingCount;
};

main().catch((error) => {
  console.error(`Schema compatibility check could not run: ${error.message}`);
  process.exit(1);
});
