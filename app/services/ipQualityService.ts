import type { IPQualityResult } from "../types/ipQuality";
import { cacheResult } from "../utils/cache";
import { fetchWithTimeout } from "../utils/fetch";
import { analyzeWithLLM } from "../utils/llm";

const API_TIMEOUT = 5000;

export class IPQualityService {
  async check(ip: string): Promise<IPQualityResult> {
    const cached = await cacheResult(`ip-quality:${ip}`);
    if (cached) return cached;

    const apis = this.buildApis(ip);
    const { regularApis, asnDependentApis } = this.partitionApis(apis);

    const phase1Results = await this.callApis(regularApis);
    const merged = this.mergeResults(phase1Results);

    const asn = merged.asn || merged.ASN || merged.as;
    if (asn) {
      const asnResults = await this.callApis(asnDependentApis, asn);
      phase1Results.push(...asnResults);
    }

    const mergedResult = this.mergeResults(phase1Results);
    const enhancedResult = await this.enhanceResult(mergedResult, ip);

    await cacheResult(`ip-quality:${ip}`, enhancedResult, 900);
    return enhancedResult;
  }

  private buildApis(ip: string) {
    return [
      {
        name: "ipqs",
        url: `https://www.ipqualityscore.com/api/json/ip/${IPQS_KEY}/${ip}`,
        enabled: Boolean(IPQS_KEY),
        transform: (d: any) => this.transformIPQS(d),
      },
      {
        name: "ipapi",
        url: `https://ip-api.io/json/${ip}`,
        enabled: true,
        transform: (d: any) => this.transformIPApi(d),
      },
      {
        name: "abuseipdb",
        url: "https://api.abuseipdb.com/api/v2/check",
        enabled: Boolean(ABUSEIPDB_KEY),
        headers: { Key: ABUSEIPDB_KEY, Accept: "application/json" },
        params: { ipAddress: ip, maxAgeInDays: 90 },
        transform: (d: any) => this.transformAbuseIPDB(d),
      },
      {
        name: "ip2location",
        url: "https://api.ip2location.io/",
        enabled: Boolean(IP2LOCATION_KEY),
        params: { key: IP2LOCATION_KEY, ip },
        transform: (d: any) => this.transformIP2Location(d),
      },
      {
        name: "ipdata",
        url: `https://api.ipdata.co/${ip}`,
        enabled: Boolean(IPDATA_KEY),
        params: { "api-key": IPDATA_KEY },
        transform: (d: any) => this.transformIPData(d),
      },
      {
        name: "cloudflare_asn",
        enabled: Boolean(CLOUDFLARE_API_TOKEN),
        requiresASN: true,
        buildUrl: (asn: string) => this.buildCloudflareURL(asn),
        headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` },
        transform: (d: any) => this.transformCloudflare(d),
      },
    ];
  }

  private partitionApis(apis: any[]) {
    const regularApis = apis.filter((api) => api.enabled && !api.requiresASN);
    const asnDependentApis = apis.filter(
      (api) => api.enabled && api.requiresASN,
    );
    return { regularApis, asnDependentApis };
  }

  private async callApis(apis: any[], asn?: string) {
    const results = await Promise.allSettled(
      apis.map(async (api) => {
        const url = api.requiresASN ? api.buildUrl(asn) : api.url;
        const response = await fetchWithTimeout(url, API_TIMEOUT, {
          headers: api.headers,
          params: api.params,
        });
        const data = await response.json();
        return { source: api.name, data: api.transform(data) };
      }),
    );

    return results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);
  }

  private mergeResults(results: any[]) {
    return results.reduce((acc, result) => ({ ...acc, ...result.data }), {});
  }

  private async enhanceResult(data: any, ip: string) {
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

  private determineNative(data: any) {
    const geoCountry = data.countryCode || data.country_code;
    const ip2locCountry = data.ip2location_country_code;
    return geoCountry && ip2locCountry ? geoCountry === ip2locCountry : true;
  }

  private determineDualISP(data: any) {
    return data.isp && data.org && data.isp !== data.org;
  }

  private determineIPType(data: any) {
    if (data.connection_type) return data.connection_type;
    if (data.usageType) return data.usageType;
    if (data.isHosting) return "Data Center";
    if (data.isMobile) return "Mobile";
    return "Residential";
  }

  private transformIPQS(d: any) { return d; }
  private transformIPApi(d: any) { return d; }
  private transformAbuseIPDB(d: any) { return d; }
  private transformIP2Location(d: any) { return d; }
  private transformIPData(d: any) { return d; }
  private transformCloudflare(d: any) { return d; }

  private buildCloudflareURL(asn: string) {
    const match = asn.toString().match(/\d+/);
    if (!match) throw new Error(`Invalid ASN format: ${asn}`);
    return `https://api.cloudflare.com/client/v4/radar/http/summary/bot_class?asn=${match[0]}&dateRange=7d&format=json`;
  }
}
