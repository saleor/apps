/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  rewrites() {
    return {
      fallback: [
        {
          source: "/:path*",
          destination: `${process.env.MONITORING_APP_API_URL}/:path*`,
        },
      ],
    };
  },
};
