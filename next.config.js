/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages that should not be bundled (moved from experimental)
  serverExternalPackages: [
    '@genkit-ai/core',
    '@genkit-ai/firebase', 
    '@opentelemetry/sdk-node',
    'handlebars'
  ],

  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // For better compatibility with Netlify
  trailingSlash: false,
  
  // TypeScript configuration
  typescript: {
    // Disable type checking during build (we'll handle it separately)
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig