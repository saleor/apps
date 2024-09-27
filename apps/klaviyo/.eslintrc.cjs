module.exports = {
  root: true,
  extends: ["saleor"],
  rules: {
    "no-console": "error",
    "@saleor/saleor-app/logger-leak": "warn",
  },
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
};
