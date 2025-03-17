module.exports = {
  root: true,
  extends: ["@saleor/eslint-config-apps"],
  rules: {
    "no-console": "error",
    "@saleor/saleor-app/logger-leak": "warn",
  },
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ["generated", "coverage"],
};
