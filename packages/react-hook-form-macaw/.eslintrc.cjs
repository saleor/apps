module.exports = {
  root: true,
  extends: ["@saleor/eslint-config-apps"],
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  overrides: [
    {
      files: ["*stories.tsx"],
      rules: {
        // Stories require default export for storybook
        "import/no-default-export": "off",
        // Story wrapper is an exception to the rule
        "react-hooks/rules-of-hooks": "off",
      },
    },
  ],
};
