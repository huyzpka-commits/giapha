/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  basePath: '/giapha',
  images: {
    unoptimized: true,
  },
};
export default nextConfig;
