import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  productionBrowserSourceMaps: false,
  reactStrictMode: false,
  images: {
    domains: ["wcttpspl66.ufs.sh"], // Add your UploadThing domain here
  },
};



export default nextConfig;
