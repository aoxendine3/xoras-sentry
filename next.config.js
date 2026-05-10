/**
 * Next.js configuration for XORAS Sentry web app.
 * Sets Turbopack root to avoid workspace‑root warnings.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopack: {
      // Use the directory of this config file as the root for Turbopack.
      // This silences the warning about multiple lockfiles.
      root: __dirname,
    },
  },
  // Enable experimental edge runtime for middleware (already used).
  // This flag is optional but documents the intent.
  // runtime = 'experimental-edge' is set in middleware.ts.
};

module.exports = nextConfig;
