import type { NextConfig } from "next";

declare function getNextJsConfigWithSentry(options: {
  project: string | undefined;
  nextConfig?: NextConfig;
}) {
  return NextConfig;
};
