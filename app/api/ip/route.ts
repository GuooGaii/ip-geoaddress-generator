import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Cloudflare 在这些请求头中提供客户端 IP
  const ip = 
    request.headers.get('cf-connecting-ip') || 
    request.headers.get('x-real-ip') || 
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    'Unknown';

  return NextResponse.json({ ip });
}
