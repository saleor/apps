/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ["@saleor/apps-shared"],
  reactStrictMode: true,
  rewrites() {
    /**
     * For dev/preview Next.js can work as a proxy and redirect unknown paths to provided backend address
     *
     * In production, when env is not provided, frontend will call its relative path and reverse proxy will do the rest
     */
    const backendPath = process.env.MONITORING_APP_API_URL ?? "";

    return {
      fallback: [
        {
          source: "/:path*",
          destination: `${backendPath}/:path*`,
        },
      ],
    };
  },
};
