module.exports = {
  root: true,
  extends: ["saleor"],
  rules: {
    "@saleor/saleor-app/logger-leak": "off",
  },
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
};
