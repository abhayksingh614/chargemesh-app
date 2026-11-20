/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@chargemesh/shared-types', '@chargemesh/shared-constants'],
};

module.exports = nextConfig;
