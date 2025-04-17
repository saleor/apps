import baseConfig from "../../lint-staged.config.js";

/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  ...baseConfig,
  // run eslint first & then format with prettier, excluding generated files
  "*.{jsx,tsx,ts,js,graphql}!(generated/**/*)": ["eslint --cache --fix", "prettier --write"],
};
