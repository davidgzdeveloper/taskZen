/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore build warnings for packages that aren't used in production
  webpack: (config, { isServer }) => {
    // Ignore problematic AI packages during build
    if (isServer) {
      config.externals.push({
        '@genkit-ai/firebase': 'commonjs @genkit-ai/firebase',
        '@opentelemetry/exporter-jaeger': 'commonjs @opentelemetry/exporter-jaeger',
        'handlebars': 'commonjs handlebars'
      });
    }
    
    // Add fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    return config;
  },
  
  // Experimental features for better performance
  experimental: {
    serverComponentsExternalPackages: [
      '@genkit-ai/core',
      '@genkit-ai/firebase', 
      '@opentelemetry/sdk-node',
      'handlebars'
    ]
  },

  // Environment variables that should be available to the client
  env: {
    NEXT_PUBLIC_APP_NAME: 'TaskZen',
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // For better compatibility with Netlify
  trailingSlash: false,
}

module.exports = nextConfig