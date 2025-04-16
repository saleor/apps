import baseConfig from "../../lint-staged.config.js";

/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  ...baseConfig,
  // run eslint first & then format with prettier
  "*.{jsx,tsx,ts,js,graphql}": ["eslint --cache --fix", "prettier '!**/generated' --write"],
};
