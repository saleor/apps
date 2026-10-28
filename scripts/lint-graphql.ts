#!/usr/bin/env node
/**
 * Lints GraphQL documents: deprecated schema usage and kebab-case filenames matching the first
 * operation/fragment name. Replaces @graphql-eslint, which oxlint can't run (no custom parsers).
 * Reports warnings only, it never fails.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { buildSchema, Kind, NoDeprecatedCustomRule, parse, validate } from "graphql";

type Warning = {
  file: string;
  line: number;
  rule: "no-deprecated" | "match-document-filename";
  message: string;
};

const root = path.resolve(import.meta.dirname, "..");

/*
 * Apps keep their own copy of the schema for codegen, but all copies come from the root one
 * (`pnpm fetch-schema`), so lint against that single source.
 */
const schema = buildSchema(readFileSync(path.join(root, "schema.graphql"), "utf8"));

const files = execFileSync("git", ["ls-files", "apps/**/*.graphql", "packages/**/*.graphql"], {
  cwd: root,
  encoding: "utf8",
})
  .split("\n")
  .filter(
    (file) => file && path.basename(file) !== "schema.graphql" && !file.includes("/generated/"),
  );

// Same word split as lodash.lowercase, which @graphql-eslint uses: "XMLHttp2Fragment" -> "xml-http-2-fragment"
const toKebabCase = (name: string) =>
  (name.match(/[A-Z]?[a-z]+|[A-Z]+(?=[A-Z][a-z]|[^A-Za-z]|$)|[A-Z]+|\d+/g) ?? [])
    .map((word) => word.toLowerCase())
    .join("-");

const warnings: Warning[] = files.flatMap((file): Warning[] => {
  const document = parse(readFileSync(path.join(root, file), "utf8"));

  const deprecated = validate(schema, document, [NoDeprecatedCustomRule]).map((error) => ({
    file,
    line: error.locations?.[0]?.line ?? 1,
    rule: "no-deprecated" as const,
    message: error.message,
  }));

  const firstDocument =
    document.definitions.find((node) => node.kind === Kind.OPERATION_DEFINITION) ??
    document.definitions.find((node) => node.kind === Kind.FRAGMENT_DEFINITION);
  const documentName = firstDocument?.name?.value;
  const expectedFilename = documentName && `${toKebabCase(documentName)}.graphql`;

  const filename =
    expectedFilename && expectedFilename !== path.basename(file)
      ? [
          {
            file,
            line: 1,
            rule: "match-document-filename" as const,
            message: `File "${path.basename(file)}" should be named "${expectedFilename}"`,
          },
        ]
      : [];

  return [...deprecated, ...filename];
});

for (const { file, line, rule, message } of warnings) {
  console.log(
    process.env.GITHUB_ACTIONS
      ? `::warning file=${file},line=${line},title=${rule}::${message}`
      : `warn ${file}:${line} ${rule} ${message}`,
  );
}

console.log(`${files.length} documents, ${warnings.length} warnings`);
