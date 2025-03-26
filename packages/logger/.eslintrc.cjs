module.exports = {
  root: true,
  extends: ["@saleor/eslint-config-apps"],
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    "no-console": "off",
  },
  ignorePatterns: ["coverage", "lint-staged.config.js"],
};
