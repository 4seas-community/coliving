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
  // Every image on the site already renders through next/image, but v0
  // shipped `unoptimized: true`, which turns it into a plain <img> and
  // serves whatever was committed — camera originals, several MB each,
  // into layout slots a few hundred pixels wide. With optimisation on,
  // Next emits a srcset, negotiates AVIF/WebP, and lazy-loads anything
  // below the fold, so a 330px slot fetches a 330px file.
  images: {
    formats: ['image/avif', 'image/webp'],
    // Widths the layout actually asks for via `sizes`, so Next does not
    // generate variants nobody requests.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    // Optimised results are content-addressed, so they can be cached hard.
    minimumCacheTTL: 60 * 60 * 24 * 30,
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
