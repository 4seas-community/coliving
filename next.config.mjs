/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Server Actions default to a 1mb request body limit. The admin
    // Settings tab uploads photos straight to a Server Action
    // (uploadSiteImage), so any real photo above ~1mb would fail with
    // a client-side "Failed to fetch" before ever reaching the server.
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig
