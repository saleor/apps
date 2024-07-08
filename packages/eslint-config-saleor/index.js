module.exports = {
  extends: ["next", "turbo", "prettier"],
  parser: "@typescript-eslint/parser",
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "react/jsx-key": "off",
    "import/no-default-export": "error",
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
