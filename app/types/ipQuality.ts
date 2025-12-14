export interface IPQualityResult {
  ip?: string;
  fraudScore?: number;
  abuseScore?: number;
  ipType?: string;
  isp?: string;
  org?: string;
  asn?: string;
  ASN?: string;
  isVpn?: boolean;
  isProxy?: boolean;
  isTor?: boolean;
  isHosting?: boolean;
  isNative?: boolean;
  isDualIsp?: boolean;
  cf_asn_bot_pct?: number;
  cf_asn_human_pct?: number;
  cf_asn_likely_bot?: boolean;
  sources?: string[];
  aiReasoning?: string;
  timestamp?: string;
  [key: string]: unknown;
}