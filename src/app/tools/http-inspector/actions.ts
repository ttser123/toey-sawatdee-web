'use server';

export interface HttpInspectorResult {
  success: boolean;
  error?: string;
  url: string;
  status: number;
  statusText: string;
  timingMs: number;
  headers: Record<string, string>;
  bodySnippet: string;
  isJson: boolean;
}

export async function inspectUrl(url: string, method: string = 'GET'): Promise<HttpInspectorResult> {
  const startTime = performance.now();
  
  try {
    // Validate URL
    let targetUrl = url;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }
    new URL(targetUrl); // Throws if invalid

    const response = await fetch(targetUrl, {
      method,
      // Pass typical browser headers to avoid being blocked by simple anti-bot
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 MissionControl/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      // Do not follow redirects automatically so we can inspect redirect responses (e.g. 301/302)
      redirect: 'manual',
    });

    const endTime = performance.now();
    
    // Extract Headers
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    // Extract Body snippet
    let bodySnippet = '';
    let isJson = false;
    
    const contentType = headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      isJson = true;
      try {
        const json = await response.json();
        bodySnippet = JSON.stringify(json, null, 2);
      } catch (e) {
        bodySnippet = await response.text();
      }
    } else {
      // Get first 2000 chars to avoid memory issues with huge payloads
      const text = await response.text();
      bodySnippet = text.substring(0, 2000);
      if (text.length > 2000) {
        bodySnippet += '\n... [TRUNCATED] ...';
      }
    }

    return {
      success: true,
      url: targetUrl,
      status: response.status,
      statusText: response.statusText,
      timingMs: Math.round(endTime - startTime),
      headers,
      bodySnippet,
      isJson
    };
  } catch (error: any) {
    const endTime = performance.now();
    return {
      success: false,
      error: error.message || 'Failed to inspect URL',
      url,
      status: 0,
      statusText: '',
      timingMs: Math.round(endTime - startTime),
      headers: {},
      bodySnippet: '',
      isJson: false
    };
  }
}
