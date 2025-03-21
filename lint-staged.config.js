/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  "*.{jsx,tsx,js,ts,md}": "cspell --no-must-find-files",
  // https://github.com/lint-staged/lint-staged#task-concurrency
  "!(*.jsx|*.tsx|*.ts|*.js|*.cjs)": ["prettier --ignore-unknown --write"],
  "package.json": "sort-package-json",
};
