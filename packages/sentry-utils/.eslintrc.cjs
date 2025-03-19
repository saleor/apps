module.exports = {
  root: true,
  extends: ["@saleor/eslint-config-apps"],
  rules: {
    "no-console": "off",
    "@saleor/saleor-app/logger-leak": "error",
    "max-params": ["error", { max: 3 }],
    "@vitest/prefer-strict-equal": "error",
    "@vitest/prefer-vi-mocked": "error",
  },
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
};
