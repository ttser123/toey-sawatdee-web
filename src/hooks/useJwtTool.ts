import { useState, useEffect } from 'react';
import { decodeJwt, DecodedJwt } from '@/lib/jwt-utils';

export function useJwtTool() {
  const [token, setToken] = useState<string>('');
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);

  useEffect(() => {
    if (!token.trim()) {
      setDecoded(null);
      return;
    }
    const result = decodeJwt(token.trim());
    setDecoded(result);
  }, [token]);

  return {
    token,
    setToken,
    decoded
  };
}
