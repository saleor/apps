module.exports = {
  extends: ["next", "turbo", "prettier"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "react/jsx-key": "off",
    "import/no-default-export": "error",
    "newline-after-var": "warn",
    "multiline-comment-style": ["warn", "starred-block"],
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
  ],
  ignorePatterns: ["next-env.d.ts"],
};
