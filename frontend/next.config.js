/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Tránh Next chọn nhầm root vì có package-lock ở thư mục cha
  outputFileTracingRoot: path.join(__dirname),
};

module.exports = nextConfig;
