/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removido experimental.appDir pois não é mais necessário no Next.js 14
  reactStrictMode: false, // Desabilitar temporariamente para testar
  swcMinify: true,
  experimental: {
    forceSwcTransforms: true,
  },
  
  // Configurações de SEO e Performance
  poweredByHeader: false,
  compress: true,
  
  // Headers de segurança e SEO
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Headers de SEO
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      // Headers específicos para sitemap
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
      // Headers para robots.txt
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
    ]
  },
  
  // Configurações de imagens
  images: {
    domains: [
      'confissoesdecorno.com',
      'localhost',
      'res.cloudinary.com', // Se usar Cloudinary
      's3.amazonaws.com', // Se usar AWS S3
      'api.qrserver.com', // API para gerar QR Codes
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Configurações de rewrites
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      // Redirecionar www para non-www para SEO
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.confissoesdecorno.com',
          },
        ],
        destination: 'https://confissoesdecorno.com/:path*',
      },
    ]
  },

  // Configurações de SEO
  async redirects() {
    return [
      // Redirecionamentos permanentes para SEO
      {
        source: '/confissoes-de-corno',
        destination: '/',
        permanent: true,
      },
      {
        source: '/confissoes',
        destination: '/',
        permanent: true,
      },
      {
        source: '/corno',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // Configurações de compressão
  compress: true,
  
  // Configurações de cache
  generateEtags: true,
  
  // Configurações de otimização
  optimizeFonts: true,
  
  // Configurações de bundle analyzer (opcional)
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       fs: false,
  //     };
  //   }
  //   return config;
  // },
}

module.exports = nextConfig 