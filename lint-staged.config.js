/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  "*.{jsx,tsx,js,ts}": "cspell --no-must-find-files",
  "package.json": "sort-package-json",
};
