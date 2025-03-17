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
     * This should be error once fixed in the codebase
     */
    "max-params": [
      "warn",
      {
        max: 3,
      },
    ],
    "import/order": "off", // to avoid conflicts with simple-import-sort
    "import/first": "warn",
    "import/newline-after-import": "warn",
    "import/no-duplicates": "warn",
    "import/no-default-export": "warn",
    "simple-import-sort/imports": "warn",
    "simple-import-sort/exports": "warn",
    "@next/next/no-html-link-for-pages": "off",
    "react/jsx-key": "off",
    "newline-after-var": "warn",
    "@vitest/prefer-strict-equal": "warn",
    "@vitest/prefer-vi-mocked": "warn",
    "multiline-comment-style": ["warn", "starred-block"],
    "no-restricted-imports": [
      "error",
      { name: "@saleor/apps-logger", message: "Use your app logger directly" },
    ],
  },
  parserOptions: {
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
  },
  overrides: [
    {
      files: ["src/pages/**/*", "src/pages/api/**/*", "vitest.config.ts", "generated/graphql.ts"],
      rules: {
        "import/no-default-export": "off",
      },
    },
    {
      files: ["src/logger.ts"],
      rules: {
        "no-restricted-imports": "off",
      },
    },
    {
      files: ["next.config.js"],
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
