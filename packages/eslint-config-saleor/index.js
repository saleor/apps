module.exports = {
  extends: ["next", "turbo", "prettier"],
  rules: {},
  parserOptions: {
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
  },
};
