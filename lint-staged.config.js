import path from "node:path";

/*
 * Vendored schema copies are Saleor output, and some are symlinks Prettier refuses to format
 * when named explicitly, so only our documents get formatted.
 */
const isDocument = (file) =>
  path.basename(file) !== "schema.graphql" && !file.includes("/generated/");

/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  "*.{jsx,tsx,js,ts,md}": "cspell --no-must-find-files",
  "package.json": "sort-package-json",
  "*.graphql": (files) => {
    const documents = files.filter(isDocument).map((file) => JSON.stringify(file));

    if (documents.length === 0) {
      return [];
    }

    return [`prettier --write ${documents.join(" ")}`];
  },
};
