import { useState } from 'react';
import { inspectUrl, HttpInspectorResult } from '@/app/tools/http-inspector/actions';

export function useHttpInspector() {
  const [url, setUrl] = useState<string>('');
  const [method, setMethod] = useState<string>('GET');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<HttpInspectorResult | null>(null);

  const handleInspect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await inspectUrl(url, method);
      setResult(res);
    } catch (err: any) {
      setResult({
        success: false,
        error: err.message,
        url,
        status: 0,
        statusText: '',
        timingMs: 0,
        headers: {},
        bodySnippet: '',
        isJson: false
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    url,
    setUrl,
    method,
    setMethod,
    loading,
    result,
    handleInspect
  };
}
