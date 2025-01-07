module.exports = {
  root: true,
  extends: ["saleor"],
  plugins: ["node"],
  rules: {
    "turbo/no-undeclared-env-vars": ["error"],
    "node/no-process-env": ["error"],
  },
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ["**/generated/graphql.ts"],
};
