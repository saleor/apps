import { type NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@saleor/apps-shared"],
  bundlePagesRouterDependencies: true,
};

export default nextConfig;
