import type { KnipConfig } from "knip";

const config: KnipConfig = {
  ignore: ["**/generated/**/*"],
  // oxlint loads these through `jsPlugins` in .oxlintrc.json, which knip does not read.
  ignoreDependencies: [
    "@next/eslint-plugin-next",
    "@stylistic/eslint-plugin",
    "@vitest/eslint-plugin",
    "eslint-plugin-depend",
    "eslint-plugin-react",
    "eslint-plugin-simple-import-sort",
    "eslint-plugin-turbo",
  ],
};

export default config;
