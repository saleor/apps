module.exports = {
  plugins: ["simple-import-sort"],
  extends: ["next", "turbo", "prettier"],
  rules: {
    "simple-import-sort/imports": "warn",
    "simple-import-sort/exports": "warn",
  },
};
