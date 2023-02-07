/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  reactStrictMode: true,
  experimental: {
    esmExternals: true,
  },
  transpilePackages: ["nuvo-react", "@saleor/apps-shared"],
};
