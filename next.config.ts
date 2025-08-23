import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qbs5samke2sj0bbb.public.blob.vercel-storage.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "7jwlofbzaq4pzktn.public.blob.vercel-storage.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "aquapp.blob.core.windows.net",
        port: "",
      },
    ],
  },
};

export default nextConfig;
