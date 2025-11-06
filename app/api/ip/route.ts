import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  console.log('=== /api/ip 路由被调用 ===');
  
  // Cloudflare 在这些请求头中提供客户端 IP
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  const xRealIp = request.headers.get('x-real-ip');
  const xForwardedFor = request.headers.get('x-forwarded-for');
  
  console.log('请求头信息:', {
    'cf-connecting-ip': cfConnectingIp,
    'x-real-ip': xRealIp,
    'x-forwarded-for': xForwardedFor,
  });
  
  const ip = cfConnectingIp || xRealIp || xForwardedFor?.split(',')[0] || 'Unknown';
  
  console.log('最终返回的 IP:', ip);

  return NextResponse.json({ 
    ip,
    // 添加调试信息
    debug: {
      headers: {
        'cf-connecting-ip': cfConnectingIp,
        'x-real-ip': xRealIp,
        'x-forwarded-for': xForwardedFor,
      },
      timestamp: new Date().toISOString(),
    }
  });
}
