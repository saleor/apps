module.exports = {
  root: true,
  extends: ["@saleor/eslint-config-apps"],
  plugins: ["@typescript-eslint", "neverthrow", "node"],
  rules: {
    "no-console": "error",
    "@saleor/saleor-app/logger-leak": "error",
    "max-params": ["error", { max: 3 }],
    "@vitest/prefer-strict-equal": "error",
    "@vitest/prefer-vi-mocked": "error",
    "turbo/no-undeclared-env-vars": ["error"],
    "node/no-process-env": ["error"],
    "@typescript-eslint/no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["**/__tests__/**"],
            message: "Tests related code cannot be imported into application code",
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ["*.test.tsx", "*.test.ts", "**/__tests__/**/*.ts?(x)"],
      rules: {
        "@typescript-eslint/no-restricted-imports": "off",
      },
    },
  ],
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ["generated", "coverage"],
};
