import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/RyanReport",
  assetPrefix: "/RyanReport/",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
