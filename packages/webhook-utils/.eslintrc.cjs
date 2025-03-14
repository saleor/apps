module.exports = {
  root: true,
  extends: ["@saleor/eslint-config-apps"],
  rules: {
    "@saleor/saleor-app/logger-leak": "off",
  },
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ["generated", "coverage"],
};
