/** @type {import('next').NextConfig} */

module.exports = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "gibwork-dev.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "test.ui.gib.work",
      },
      {
        protocol: "https",
        hostname: "app.gib.work",
      },
      {
        protocol: "https",
        hostname: "v2.gib.work",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
  },
};
