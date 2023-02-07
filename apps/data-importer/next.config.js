/**
 * TODO This should be solved using transpilePackages option
 */
const withTM = require("next-transpile-modules")(["nuvo-react"]);

module.exports = withTM({
  reactStrictMode: true,
  experimental: {
    esmExternals: true,
  },
});
