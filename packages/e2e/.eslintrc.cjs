module.exports = {
  root: true,
  extends: ["@saleor/eslint-config-apps"],
  rules: {
    "no-console": "off",
  },
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ["lint-staged.config.js"],
};
