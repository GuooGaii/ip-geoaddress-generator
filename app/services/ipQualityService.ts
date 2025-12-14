import type { IPQualityResult } from "../types/ipQuality";

// ============ 环境变量 ============
const IPQS_KEY = process.env.IPQS_KEY || "";
const ABUSEIPDB_KEY = process.env.ABUSEIPDB_KEY || "";
const IP2LOCATION_KEY = process.env.IP2LOCATION_KEY || "";
const IPDATA_KEY = process.env.IPDATA_KEY || "";
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || "";
const LLM_API_KEY = process.env.LLM_API_KEY || "";
const LLM_BASE_URL = process.env.LLM_BASE_URL || "";
const LLM_MODEL = process.env.LLM_MODEL || "gpt-3.5-turbo";

// ============ 内联工具函数 ============

// 内存缓存（Cloudflare Pages 无 Redis，后续可切 KV）
const cache = new Map<string, { data: IPQualityResult; expires: number }>();

function cacheGet(key: string): IPQualityResult | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function cacheSet(key: string, data: IPQualityResult, ttlSeconds: number): void {
  cache.set(key, { data, expires: Date.now() + ttlSeconds * 1000 });
}

// 带超时的 fetch
async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  options?: { headers?: Record<string, string>; params?: Record<string, string> }
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let finalUrl = url;
  if (options?.params) {
    const searchParams = new URLSearchParams(options.params);
    finalUrl += (url.includes("?") ? "&" : "?") + searchParams.toString();
  }

  try {
    const response = await fetch(finalUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        ...options?.headers,
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// LLM 分析（可选）
async function analyzeWithLLM(
  data: Record<string, unknown>,
  ip: string
): Promise<{ reasoning: string }> {
  if (!LLM_API_KEY || !LLM_BASE_URL) {
    return { reasoning: "" };
  }

  const prompt = `分析以下 IP 质量数据，给出专业的风险评估报告：
IP: ${ip}
数据: ${JSON.stringify(data, null, 2)}

请用中文输出，包含：
1. IP 类型判断
2. 风险等级评估
3. 适用场景建议`;

  try {
    const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      return { reasoning: "" };
    }

    const result = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    return { reasoning: result.choices?.[0]?.message?.content || "" };
  } catch {
    return { reasoning: "" };
  }
}

// ============ 类型定义 ============

type MergedResult = Record<string, unknown> & { sources: string[] };

// ============ 主服务类 ============

const API_TIMEOUT = 5000;

interface ApiConfig {
  name: string;
  url?: string;
  enabled: boolean;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  requiresASN?: boolean;
  buildUrl?: (asn: string) => string;
  transform: (d: Record<string, unknown>) => Record<string, unknown>;
}

export class IPQualityService {
  async check(ip: string): Promise<IPQualityResult> {
    const cacheKey = `ip-quality:${ip}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    const apis = this.buildApis(ip);
    const { regularApis, asnDependentApis } = this.partitionApis(apis);

    const phase1Results = await this.callApis(regularApis);
    const merged = this.mergeResults(phase1Results);

    const asn = (merged.asn || merged.ASN || merged.as) as string | undefined;
    if (asn && asnDependentApis.length > 0) {
      const asnResults = await this.callApis(asnDependentApis, asn);
      phase1Results.push(...asnResults);
    }

    const mergedResult = this.mergeResults(phase1Results);
    const enhancedResult = await this.enhanceResult(mergedResult, ip);

    cacheSet(cacheKey, enhancedResult as IPQualityResult, 900);
    return enhancedResult as IPQualityResult;
  }

  private buildApis(ip: string): ApiConfig[] {
    return [
      {
        name: "ipqs",
        url: `https://www.ipqualityscore.com/api/json/ip/${IPQS_KEY}/${ip}`,
        enabled: Boolean(IPQS_KEY),
        transform: (d) => this.transformIPQS(d),
      },
      {
        name: "ipapi",
        url: `https://ip-api.io/${ip}`,
        enabled: true,
        transform: (d) => this.transformIPApi(d),
      },
      {
        name: "abuseipdb",
        url: "https://api.abuseipdb.com/api/v2/check",
        enabled: Boolean(ABUSEIPDB_KEY),
        headers: { Key: ABUSEIPDB_KEY, Accept: "application/json" },
        params: { ipAddress: ip, maxAgeInDays: "90" },
        transform: (d) => this.transformAbuseIPDB(d),
      },
      {
        name: "ip2location",
        url: "https://api.ip2location.io/",
        enabled: Boolean(IP2LOCATION_KEY),
        params: { key: IP2LOCATION_KEY, ip },
        transform: (d) => this.transformIP2Location(d),
      },
      {
        name: "ipdata",
        url: `https://api.ipdata.co/${ip}`,
        enabled: Boolean(IPDATA_KEY),
        params: { "api-key": IPDATA_KEY },
        transform: (d) => this.transformIPData(d),
      },
      {
        name: "cloudflare_asn",
        enabled: Boolean(CLOUDFLARE_API_TOKEN),
        requiresASN: true,
        buildUrl: (asn: string) => this.buildCloudflareURL(asn),
        headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` },
        transform: (d) => this.transformCloudflare(d),
      },
    ];
  }

  private partitionApis(apis: ApiConfig[]) {
    const regularApis = apis.filter((api) => api.enabled && !api.requiresASN);
    const asnDependentApis = apis.filter((api) => api.enabled && api.requiresASN);
    return { regularApis, asnDependentApis };
  }

  private async callApis(apis: ApiConfig[], asn?: string) {
    const results = await Promise.allSettled(
      apis.map(async (api) => {
        const url = api.requiresASN && api.buildUrl ? api.buildUrl(asn!) : api.url!;
        const response = await fetchWithTimeout(url, API_TIMEOUT, {
          headers: api.headers,
          params: api.params,
        });
        const data = await response.json() as Record<string, unknown>;
        return { source: api.name, data: api.transform(data) };
      })
    );

    return results
      .filter((result): result is PromiseFulfilledResult<{ source: string; data: Record<string, unknown> }> =>
        result.status === "fulfilled"
      )
      .map((result) => result.value);
  }

  private mergeResults(results: Array<{ source: string; data: Record<string, unknown> }>): MergedResult {
    const sources: string[] = [];
    const merged = results.reduce((acc, result) => {
      sources.push(result.source);
      return { ...acc, ...result.data };
    }, {} as Record<string, unknown>);
    return { ...merged, sources };
  }

  private async enhanceResult(data: MergedResult, ip: string) {
    const isNative = this.determineNative(data);
    const isDualIsp = this.determineDualISP(data);

    const result = {
      ip,
      ...data,
      isNative,
      isDualIsp,
      ipType: this.determineIPType(data),
      timestamp: new Date().toISOString(),
    };

    if (LLM_API_KEY && LLM_BASE_URL) {
      const aiResult = await analyzeWithLLM(result, ip);
      return { ...result, aiReasoning: aiResult.reasoning };
    }

    return result;
  }

  private determineNative(data: Record<string, unknown>) {
    const geoCountry = data.countryCode || data.country_code;
    const ip2locCountry = data.ip2location_country_code;
    return geoCountry && ip2locCountry ? geoCountry === ip2locCountry : true;
  }

  private determineDualISP(data: Record<string, unknown>) {
    return data.isp && data.org && data.isp !== data.org;
  }

  private determineIPType(data: Record<string, unknown>) {
    if (data.connection_type) return data.connection_type as string;
    if (data.usageType) return data.usageType as string;
    if (data.isHosting) return "Data Center";
    if (data.isMobile) return "Mobile";
    return "Residential";
  }

  private transformIPQS(d: Record<string, unknown>) {
    return {
      fraudScore: d.fraud_score,
      isVpn: d.vpn,
      isProxy: d.proxy,
      isTor: d.tor,
      isHosting: d.host,
      isMobile: d.mobile,
      connection_type: d.connection_type,
    };
  }

  private transformIPApi(d: Record<string, unknown>) {
    return {
      countryCode: d.country_code,
      country: d.country_name,
      city: d.city,
      isp: d.isp,
      org: d.organisation,
      asn: d.asn,
      ASN: d.asn,
      as: d.asn,
    };
  }

  private transformAbuseIPDB(d: Record<string, unknown>) {
    const data = (d.data || {}) as Record<string, unknown>;
    return {
      abuseScore: data.abuseConfidenceScore,
      totalReports: data.totalReports,
      isWhitelisted: data.isWhitelisted,
    };
  }

  private transformIP2Location(d: Record<string, unknown>) {
    return {
      ip2location_country_code: d.country_code,
      usageType: d.usage_type,
      isProxy: d.is_proxy,
    };
  }

  private transformIPData(d: Record<string, unknown>) {
    const threat = (d.threat || {}) as Record<string, unknown>;
    return {
      isTor: threat.is_tor,
      isProxy: threat.is_proxy,
      isAnonymous: threat.is_anonymous,
      isKnownAbuser: threat.is_known_abuser,
      isKnownAttacker: threat.is_known_attacker,
      isThreat: threat.is_threat,
    };
  }

  private transformCloudflare(d: Record<string, unknown>) {
    const result = (d.result || {}) as Record<string, unknown>;
    const summary = (result.summary_0 || result.summary || {}) as Record<string, unknown>;
    return {
      cf_asn_bot_pct: summary.bot,
      cf_asn_human_pct: summary.human,
      cf_asn_likely_bot: Number(summary.bot || 0) > 50,
    };
  }

  private buildCloudflareURL(asn: string) {
    const match = asn.toString().match(/\d+/);
    if (!match) throw new Error(`Invalid ASN format: ${asn}`);
    return `https://api.cloudflare.com/client/v4/radar/http/summary/bot_class?asn=${match[0]}&dateRange=7d&format=json`;
  }
}