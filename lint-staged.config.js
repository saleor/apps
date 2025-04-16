/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  "*.{jsx,tsx,js,ts,md}": "cspell --no-must-find-files",
  // https://github.com/lint-staged/lint-staged#task-concurrency
  "!(*.jsx|*.tsx|*.ts|*.js|*.cjs,*.graphql)": ["prettier --ignore-unknown '!**/generated' --write"],
  "package.json": "sort-package-json",
};
