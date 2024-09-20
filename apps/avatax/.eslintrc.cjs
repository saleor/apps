module.exports = {
  root: true,
  extends: ["saleor"],
  plugins: ["neverthrow"],
  rules: {
    "turbo/no-undeclared-env-vars": ["error"],
  },
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ["**/generated/graphql.ts"],
};
