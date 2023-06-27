/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ["@saleor/apps-shared", "@saleor/apps-ui", "@saleor/react-hook-form-macaw"],
  rewrites() {
    /**
     * For dev/preview Next.js can work as a proxy and redirect unknown paths to provided backend address
     *
     * In production, when env is not provided, frontend will call its relative path and reverse proxy will do the rest
     */
    const backendPath = process.env.MONITORING_APP_API_URL;

    if(!backendPath) {
      throw new Error('Please set MONITORING_APP_API_URL variable')
    }

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
