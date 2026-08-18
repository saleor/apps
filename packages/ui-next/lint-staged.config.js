import baseConfig from "../../lint-staged.config.js";

export default {
  ...baseConfig,
  "*.{jsx,tsx,ts,js}": ["eslint --cache --fix", "prettier --write"],
};
