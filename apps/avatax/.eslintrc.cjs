module.exports = {
  root: true,
  extends: ["@saleor/eslint-config-apps"],
  plugins: ["neverthrow", "n"],
  rules: {
    "n/no-process-env": "error",
  },
  overrides: [
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
