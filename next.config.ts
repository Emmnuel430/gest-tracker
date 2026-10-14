import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/options',
        destination: '/gestion',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
