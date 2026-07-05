export interface DecodedJwt {
  header: any;
  payload: any;
  signature: string;
  isValidStructure: boolean;
  error?: string;
}

function base64UrlDecode(str: string): string {
  // Pad the base64url string with '=' to make it a multiple of 4
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  // Decode base64 and properly handle unicode characters
  const decoded = atob(base64);
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    bytes[i] = decoded.charCodeAt(i);
  }
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(bytes);
}

export function decodeJwt(token: string): DecodedJwt {
  if (!token || typeof token !== 'string') {
    return { header: null, payload: null, signature: '', isValidStructure: false, error: 'Empty token' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { 
      header: null, 
      payload: null, 
      signature: '', 
      isValidStructure: false, 
      error: 'Invalid JWT structure. Expected 3 parts separated by dots.' 
    };
  }

  try {
    const headerStr = base64UrlDecode(parts[0]);
    const payloadStr = base64UrlDecode(parts[1]);
    
    return {
      header: JSON.parse(headerStr),
      payload: JSON.parse(payloadStr),
      signature: parts[2],
      isValidStructure: true,
    };
  } catch (error: any) {
    return {
      header: null,
      payload: null,
      signature: parts[2] || '',
      isValidStructure: false,
      error: 'Failed to decode or parse JWT parts. Ensure token is a valid Base64Url format.',
    };
  }
}
