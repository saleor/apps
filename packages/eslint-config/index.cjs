module.exports = {
  extends: [
    "next",
    "turbo",
    "prettier",
    "plugin:@saleor/saleor-app/recommended",
    /*
     * After upgrade to eslint 9 config should be updated
     * https://github.com/vitest-dev/eslint-plugin-vitest/tree/main?tab=readme-ov-file#usage
     *
     * This is disabled, because it seems not to work, despite being set up just like in docs
     * Some rules are applied manually in "rules" section - they work.
     *
     * TODO: Once we upgrade Vitest and ESLint, try to set up everything again with non-legacy approach
     */
    // "plugin:@vitest/legacy-recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["simple-import-sort", "@vitest"],
  rules: {
    /**
     * In case of more than 3 args, ensure object param is introduced.
     */
    "max-params": [
      "error",
      {
        max: 3,
      },
    ],
    "import/order": "off", // to avoid conflicts with simple-import-sort
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
    "import/no-default-export": "error",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "@next/next/no-html-link-for-pages": "off",
    "react/jsx-key": "off",
    "newline-after-var": "error",
    "@vitest/prefer-strict-equal": "error",
    "@vitest/prefer-vi-mocked": "error",
    "multiline-comment-style": ["error", "starred-block"],
    "@saleor/saleor-app/logger-leak": "error",
    "turbo/no-undeclared-env-vars": "error",
    "no-console": "error",
  },
  parserOptions: {
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
  },
  overrides: [
    {
      files: [
        "src/pages/**/*",
        "src/pages/api/**/*",
        "vitest.config.ts",
        "generated/graphql.ts",
        "next.config.js",
        "vitest.workspace.ts",
        "playwright.config.ts",
      ],
      rules: {
        "import/no-default-export": "off",
      },
    },
  ],
  ignorePatterns: ["next-env.d.ts"],
  settings: {
    react: {
      version: "18.2.0",
    },
  },
};
