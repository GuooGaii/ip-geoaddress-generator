import { NextRequest, NextResponse } from "next/server";
import { IPQualityService } from "@/services/ipQualityService";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const ip = request.nextUrl.searchParams.get("ip") || "8.8.8.8";

  // 检查环境变量状态
  const envStatus = {
    IPQS_KEY: Boolean(process.env.IPQS_KEY),
    ABUSEIPDB_KEY: Boolean(process.env.ABUSEIPDB_KEY),
    IP2LOCATION_KEY: Boolean(process.env.IP2LOCATION_KEY),
    IPDATA_KEY: Boolean(process.env.IPDATA_KEY),
    CLOUDFLARE_API_TOKEN: Boolean(process.env.CLOUDFLARE_API_TOKEN),
    LLM_API_KEY: Boolean(process.env.LLM_API_KEY),
    LLM_BASE_URL: Boolean(process.env.LLM_BASE_URL),
  };

  // 测试每个 API
  const testResults: Record<string, { success: boolean; data?: unknown; error?: string }> = {};

  // 测试 ip-api.io（无需 API Key）
  try {
    const response = await fetch(`https://ip-api.io/json/${ip}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const data = await response.json();
    testResults.ipapi = { success: response.ok, data };
  } catch (error) {
    testResults.ipapi = { success: false, error: String(error) };
  }

  // 测试 IPQualityScore
  if (process.env.IPQS_KEY) {
    try {
      const response = await fetch(
        `https://www.ipqualityscore.com/api/json/ip/${process.env.IPQS_KEY}/${ip}`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );
      const data = await response.json();
      testResults.ipqs = { success: response.ok, data };
    } catch (error) {
      testResults.ipqs = { success: false, error: String(error) };
    }
  }

  // 测试 AbuseIPDB
  if (process.env.ABUSEIPDB_KEY) {
    try {
      const url = new URL("https://api.abuseipdb.com/api/v2/check");
      url.searchParams.set("ipAddress", ip);
      url.searchParams.set("maxAgeInDays", "90");
      const response = await fetch(url.toString(), {
        headers: {
          Key: process.env.ABUSEIPDB_KEY,
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
        },
      });
      const data = await response.json();
      testResults.abuseipdb = { success: response.ok, data };
    } catch (error) {
      testResults.abuseipdb = { success: false, error: String(error) };
    }
  }

  // 测试 IP2Location
  if (process.env.IP2LOCATION_KEY) {
    try {
      const url = new URL("https://api.ip2location.io/");
      url.searchParams.set("key", process.env.IP2LOCATION_KEY);
      url.searchParams.set("ip", ip);
      const response = await fetch(url.toString(), {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      const data = await response.json();
      testResults.ip2location = { success: response.ok, data };
    } catch (error) {
      testResults.ip2location = { success: false, error: String(error) };
    }
  }

  // 测试 IPData
  if (process.env.IPDATA_KEY) {
    try {
      const url = new URL(`https://api.ipdata.co/${ip}`);
      url.searchParams.set("api-key", process.env.IPDATA_KEY);
      const response = await fetch(url.toString(), {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      const data = await response.json();
      testResults.ipdata = { success: response.ok, data };
    } catch (error) {
      testResults.ipdata = { success: false, error: String(error) };
    }
  }

  // 测试完整的 IPQualityService
  let qualityResult = null;
  try {
    const service = new IPQualityService();
    qualityResult = await service.check(ip);
  } catch (error) {
    qualityResult = { error: String(error) };
  }

  return NextResponse.json({
    ip,
    envStatus,
    testResults,
    qualityResult,
    timestamp: new Date().toISOString(),
  });
}
