import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 禁用静态优化，确保每次都重新生成
  generateBuildId: async () => {
    // 使用时间戳作为构建 ID，强制更新
    return `build-${Date.now()}`;
  },
  // 添加自定义 headers 禁用缓存
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
