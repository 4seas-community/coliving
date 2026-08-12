/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-hosted on 4seas.xyz behind nginx as a systemd service, so the
  // build has to emit a runnable server.js rather than assume Vercel.
  output: 'standalone',
  // Without this Next walks up past 4seas-dev to ~/package.json (a stray
  // yarn workspace) and infers the wrong root, which buries server.js
  // several directories deep inside .next/standalone.
  outputFileTracingRoot: import.meta.dirname,
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
