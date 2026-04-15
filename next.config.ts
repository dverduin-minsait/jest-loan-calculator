import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  serverExternalPackages: [
    "@prisma/adapter-better-sqlite3",
    "@prisma/client",
  ],
};

export default nextConfig;
