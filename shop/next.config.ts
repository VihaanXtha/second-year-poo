import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The Laravel API (port 8000) serves all uploads from its public disk, and
    // those URLs are absolute (http://localhost:8000/storage/...). Next 16 also
    // refuses upstream hosts that resolve to a private/loopback IP (SSRF guard),
    // so both switches are required for local media to render.
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/storage/**" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
