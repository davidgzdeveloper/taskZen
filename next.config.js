/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server-only packages used by Genkit that should not be bundled
  serverExternalPackages: [
    '@genkit-ai/core',
    '@opentelemetry/sdk-node',
    'handlebars',
  ],

  compress: true,
  poweredByHeader: false,
  trailingSlash: false,

  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
