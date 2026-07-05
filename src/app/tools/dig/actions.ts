'use server';

import dns from 'dns/promises';

export type DnsRecordType = 'A' | 'AAAA' | 'MX' | 'TXT' | 'NS' | 'CNAME' | 'SOA' | 'PTR' | 'SRV' | 'ANY';

export interface DnsResult {
  success: boolean;
  data?: any;
  error?: string;
  timeMs?: number;
}

export async function lookupDns(domain: string, type: DnsRecordType): Promise<DnsResult> {
  const start = Date.now();
  try {
    let result: any;
    
    // Clean up domain (remove protocol, path, and trim)
    const cleanDomain = domain.replace(/^(https?:\/\/)/, '').replace(/\/.*$/, '').trim();
    
    if (!cleanDomain) {
      return { success: false, error: 'Invalid domain name.', timeMs: 0 };
    }

    // Create a dedicated resolver using public DNS to avoid local ECONNREFUSED issues
    const resolver = new dns.Resolver();
    resolver.setServers(['8.8.8.8', '1.1.1.1']);

    switch (type) {
      case 'A':
      case 'AAAA':
      case 'MX':
      case 'TXT':
      case 'NS':
      case 'CNAME':
      case 'SOA':
      case 'PTR':
      case 'SRV':
        result = await resolver.resolve(cleanDomain, type);
        break;
      case 'ANY':
        result = await resolver.resolveAny(cleanDomain);
        break;
      default:
        result = await resolver.resolve(cleanDomain, 'A');
        break;
    }
    
    return {
      success: true,
      data: result,
      timeMs: Date.now() - start
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'DNS lookup failed',
      timeMs: Date.now() - start
    };
  }
}
