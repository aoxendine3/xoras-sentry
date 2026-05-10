const path = require('path');
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopack: {
      root: '../../../../',
    },
  },
};

module.exports = nextConfig;
