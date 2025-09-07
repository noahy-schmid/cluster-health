/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.PUBLIC_URL || '',
  assetPrefix: process.env.PUBLIC_URL || '',
  trailingSlash: true,
  output: 'standalone'
}

module.exports = nextConfig
