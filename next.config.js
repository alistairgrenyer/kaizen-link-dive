/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable the built-in ESLint during build
  eslint: {
    // This setting will completely disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  // Ensure Node.js runtime is used for API routes that need it
  serverExternalPackages: ['pdf-parse'],
};

module.exports = nextConfig;
