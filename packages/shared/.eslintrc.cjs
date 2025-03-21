module.exports = {
  root: true,
  extends: ["@saleor/eslint-config-apps"],
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ["coverage", "lint-staged.config.js"],
};
