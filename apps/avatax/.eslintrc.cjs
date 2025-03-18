module.exports = {
  root: true,
  extends: ["@saleor/eslint-config-apps"],
  plugins: ["neverthrow", "node"],
  rules: {
    "turbo/no-undeclared-env-vars": ["error"],
    "node/no-process-env": ["error"],
    "max-params": ["error", { max: 3 }],
    "@vitest/prefer-strict-equal": "error",
    "@vitest/prefer-vi-mocked": "error",
  },
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ["generated", "coverage"],
};
