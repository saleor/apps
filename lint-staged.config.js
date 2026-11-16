import { execFileSync } from "node:child_process";
import path from "node:path";

/*
 * Vendored schema copies are Saleor output, and some are symlinks Prettier refuses to format
 * when named explicitly, so only our documents get formatted.
 */
const isDocument = (file) =>
  path.basename(file) !== "schema.graphql" && !file.includes("/generated/");

const quote = (files) => files.map((file) => JSON.stringify(file)).join(" ");

/*
 * Prettier reads ignore files from the cwd only (the repo root here), so every package's
 * .prettierignore is passed explicitly; its patterns stay relative to its own directory.
 */
const prettier = (files) => {
  const ignoreFiles = execFileSync("git", ["ls-files", "*.prettierignore"], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
  const ignoreFlags = [".gitignore", ...ignoreFiles].map((file) => `--ignore-path=${file}`);

  return `prettier --write ${quote(ignoreFlags)} ${quote(files)}`;
};

/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  "*.{jsx,tsx,js,ts,md}": "cspell --no-must-find-files",
  // oxlint resolves nested .oxlintrc.json files and skips its ignored paths by itself.
  "*.{js,jsx,ts,tsx}": (files) => {
    const documents = files.filter(isDocument);
    const oxlint = `oxlint --fix --no-error-on-unmatched-pattern ${quote(files)}`;

    return documents.length > 0 ? [oxlint, prettier(documents)] : [oxlint];
  },
  "package.json": "sort-package-json",
  "*.graphql": (files) => {
    const documents = files.filter(isDocument);

    return documents.length > 0 ? [prettier(documents)] : [];
  },
};
