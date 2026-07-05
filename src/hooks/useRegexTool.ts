import { useState, useEffect } from 'react';
import { evaluateRegex, RegexEvaluation } from '@/lib/regex-utils';

export function useRegexTool() {
  const [pattern, setPattern] = useState<string>('([A-Z])\\w+');
  const [flags, setFlags] = useState<string>('g');
  const [testString, setTestString] = useState<string>('Hello World! This is a Regex test.');
  const [evaluation, setEvaluation] = useState<RegexEvaluation | null>(null);

  useEffect(() => {
    // Slight debounce for performance if string is very long
    const timer = setTimeout(() => {
      const result = evaluateRegex(pattern, flags, testString);
      setEvaluation(result);
    }, 200);

    return () => clearTimeout(timer);
  }, [pattern, flags, testString]);

  const toggleFlag = (flag: string) => {
    setFlags(prev => 
      prev.includes(flag) 
        ? prev.replace(flag, '') 
        : prev + flag
    );
  };

  return {
    pattern,
    setPattern,
    flags,
    toggleFlag,
    testString,
    setTestString,
    evaluation
  };
}
