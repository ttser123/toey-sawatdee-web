import { useState } from 'react';
import { lookupDns, DnsRecordType, DnsResult } from '@/app/tools/dig/actions';

export function useDigTool() {
  const [domain, setDomain] = useState<string>('');
  const [recordType, setRecordType] = useState<DnsRecordType>('A');
  const [result, setResult] = useState<DnsResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLookup = async () => {
    if (!domain.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const res = await lookupDns(domain, recordType);
      setResult(res);
    } catch (err: any) {
      setResult({
        success: false,
        error: err.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  return {
    domain,
    setDomain,
    recordType,
    setRecordType,
    result,
    isLoading,
    handleLookup,
    handleKeyDown,
  };
}
