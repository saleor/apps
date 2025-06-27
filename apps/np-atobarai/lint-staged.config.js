import baseConfig from "../../lint-staged.config.js";

/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  ...baseConfig,
  "*.{jsx,tsx,ts,js,graphql}": ["eslint --cache --fix", "prettier --write"],
};
