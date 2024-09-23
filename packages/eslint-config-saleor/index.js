module.exports = {
  extends: ["next", "turbo", "prettier", "plugin:@saleor/saleor-app/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["simple-import-sort"],
  rules: {
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
};
