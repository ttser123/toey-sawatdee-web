import { useState, useEffect } from 'react';
import { convertBases, BaseType, BaseConversionResult } from '@/lib/base-utils';

export function useBaseConverter() {
  const [activeBase, setActiveBase] = useState<BaseType>(10);
  const [inputValue, setInputValue] = useState<string>('');
  
  const [result, setResult] = useState<BaseConversionResult>({
    binary: '',
    octal: '',
    decimal: '',
    hex: '',
    isValid: true
  });

  useEffect(() => {
    const conversion = convertBases(inputValue, activeBase);
    setResult(conversion);
  }, [inputValue, activeBase]);

  const handleInputChange = (value: string, base: BaseType) => {
    setActiveBase(base);
    setInputValue(value);
  };

  return {
    activeBase,
    inputValue,
    result,
    handleInputChange
  };
}
