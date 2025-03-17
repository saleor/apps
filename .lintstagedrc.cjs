/**
 * @type {import('lint-staged').Configuration}
 */
module.exports = {
  "*.{jsx,tsx,js,ts,md,mdx}": "eslint --cache --fix",
  "*.{jsx,tsx,js,ts,md,mdx}": "prettier --write",
  "*.{jsx,tsx,js,ts,md,mdx}": "cspell --no-must-find-files",
  "package.json": "sort-package-json",
};
