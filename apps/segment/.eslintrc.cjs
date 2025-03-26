module.exports = {
  root: true,
  extends: ["@saleor/eslint-config-apps"],
  plugins: ["@typescript-eslint", "neverthrow", "n"],
  rules: {
    "n/no-process-env": "error",
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
    {
      rules: {
        "n/no-process-env": "off",
      },
      files: ["next.config.ts", "src/env.ts", "src/instrumentation.ts"],
    },
  ],
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ["generated", "coverage", "lint-staged.config.js"],
};
