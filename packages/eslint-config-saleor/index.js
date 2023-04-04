module.exports = {
  extends: ["next", "turbo", "prettier"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "react/jsx-key": "off",
    "import/no-default-export": "error",
  },
  parserOptions: {
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
  },
  overrides: [
    {
      files: ["src/pages/**/*", "src/pages/api/**/*"],
      rules: {
        "import/no-default-export": "off",
      },
    },
  ],
};
