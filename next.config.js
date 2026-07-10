/** @type {import('next').NextConfig} */
const isDevelopment = process.env.NODE_ENV === 'development';
const scriptSrc = ["'self'", "'unsafe-inline'", ...(isDevelopment ? ["'unsafe-eval'"] : [])].join(' ');
const connectSrc = [
  "'self'",
  'https://*.coloradomesh.org',
  'https://*.meshcore.coloradomesh.org',
  'https://*.letsmesh.net',
  'https://*.mapbox.com',
  'https://*.supabase.co',
  'wss://*.supabase.co',
  'https://*.basemaps.cartocdn.com',
  'https://*.carto.com',
  ...(isDevelopment ? ['ws://localhost:*', 'ws://127.0.0.1:*'] : []),
].join(' ');

const utilityCompatibilityRedirects = [
  { source: '/repeater_name_tool', destination: '/tools/repeater-name', permanent: true },
  { source: '/repeater_name_tool/', destination: '/tools/repeater-name', permanent: true },
  { source: '/companion_name_tool', destination: '/tools/companion-name', permanent: true },
  { source: '/companion_name_tool/', destination: '/tools/companion-name', permanent: true },
  { source: '/prefix_matrix', destination: '/tools/prefix-matrix', permanent: true },
  { source: '/prefix_matrix/', destination: '/tools/prefix-matrix', permanent: true },
  { source: '/serial_usb_tool', destination: '/tools/serial-usb', permanent: true },
  { source: '/serial_usb_tool/', destination: '/tools/serial-usb', permanent: true },
];

const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  async redirects() {
    return utilityCompatibilityRedirects;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value:
              `default-src 'self'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src ${connectSrc}; frame-ancestors 'none';`,
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
      {
        source: '/favicon.ico',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
    ];
  },
};

module.exports = nextConfig;
