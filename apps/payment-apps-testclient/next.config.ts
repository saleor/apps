import { type NextConfig } from "next";

const nextConfig: NextConfig = {
  output:
    process.env.NEXT_OUTPUT === "standalone"
      ? "standalone"
      : process.env.NEXT_OUTPUT === "export"
      ? "export"
      : undefined,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.saleor.cloud",
        port: "",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
    ],
  },
};

export default nextConfig;
