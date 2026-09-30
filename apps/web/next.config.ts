import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // A production build writes the same chunk filenames the dev server is
  // actively serving, which corrupts it mid-session: the browser then throws
  // "Cannot read properties of undefined (reading 'call')" from webpack.js.
  // `npm run build` therefore writes to its own directory, so verification
  // builds and `npm run dev` can run at the same time.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default config;
