import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 使用 standalone 输出模式，适合 Cloudflare Pages
  output: 'standalone',
  
  // 禁用静态优化，确保每次都重新生成
  generateBuildId: async () => {
    // 使用时间戳 + 随机数作为构建 ID，强制更新
    return `v2-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  },
  
  // 添加自定义 headers 禁用缓存
  async headers() {
    return [
      {
        // 对所有页面和资源禁用缓存
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        // 特别针对 JavaScript 文件
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0',
          },
          {
            key: 'X-Version',
            value: '2.0.0',
          },
        ],
      },
      {
        // API 路由也禁用缓存
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0',
          },
        ],
      },
    ];
  },
  
  // 禁用 SWC 的持久化缓存
  experimental: {
    webpackBuildWorker: false,
  },
};

export default nextConfig;
