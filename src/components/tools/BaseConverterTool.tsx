'use client';

import React from 'react';
import { useBaseConverter } from '@/hooks/useBaseConverter';
import { BaseType } from '@/lib/base-utils';

interface InputRowProps {
  label: string;
  base: BaseType;
  placeholder: string;
  activeBase: BaseType;
  inputValue: string;
  result: any;
  handleInputChange: (value: string, base: BaseType) => void;
  handleCopy: (text: string) => void;
}

const InputRow = ({ label, base, placeholder, activeBase, inputValue, result, handleInputChange, handleCopy }: InputRowProps) => {
  const isActiveInput = activeBase === base && inputValue.length > 0;
  
  let displayValue = '';
  if (activeBase === base) {
    displayValue = inputValue;
  } else {
    switch (base) {
      case 2: displayValue = result.binary; break;
      case 8: displayValue = result.octal; break;
      case 10: displayValue = result.decimal; break;
      case 16: displayValue = result.hex; break;
    }
  }

  const hasError = isActiveInput && !result.isValid;

  return (
    <div className="space-y-1 relative group">
      <div className="flex items-center justify-between">
        <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${isActiveInput ? 'text-indigo-600' : 'text-slate-400'}`}>
          {label} <span className="font-mono text-slate-300 ml-1">(Base {base})</span>
        </label>
        
        {displayValue && !hasError && (
          <button 
            onClick={() => handleCopy(displayValue)}
            className="text-[10px] font-mono text-slate-400 hover:text-indigo-600 transition-colors"
          >
            [COPY]
          </button>
        )}
      </div>
      
      <div className="relative">
        <textarea
          value={displayValue}
          onChange={(e) => handleInputChange(e.target.value, base)}
          placeholder={placeholder}
          className={`w-full bg-white border ${hasError ? 'border-rose-300 text-rose-700 focus:border-rose-500 focus:ring-rose-500' : isActiveInput ? 'border-indigo-400 text-indigo-900 focus:border-indigo-600 focus:ring-indigo-600' : 'border-slate-300 text-slate-700 focus:border-indigo-400 focus:ring-indigo-400'} rounded-sm px-4 py-3 text-sm font-mono font-bold focus:outline-none focus:ring-1 transition-all shadow-none break-all resize-none min-h-[100px]`}
          spellCheck={false}
        />
        {isActiveInput && (
           <div className="absolute top-1/2 right-4 -translate-y-1/2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
           </div>
        )}
      </div>
      
      {hasError && (
         <p className="text-[10px] text-rose-500 font-mono flex items-center gap-1 mt-1 absolute -bottom-5 left-0">
           <span className="material-symbols-outlined text-[12px]">error</span>
           {result.error}
         </p>
      )}
    </div>
  );
};

export default function BaseConverterTool() {
  const { activeBase, inputValue, result, handleInputChange } = useBaseConverter();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="card-blueprint p-6 md:p-8 space-y-8">
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-indigo-600 bg-indigo-50 p-2.5 rounded-sm">123</span>
          <div>
            <h2 className="text-slate-900 font-black uppercase tracking-widest text-sm">Number Base Converter</h2>
            <p className="text-slate-400 text-xs font-mono">SYSTEM: BASE_MATRIX_v1</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm border bg-emerald-50 text-emerald-700 border-emerald-200 uppercase flex items-center gap-2">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-radar-ping"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          ONLINE
        </span>
      </div>

      <div className="space-y-6">
        <p className="text-xs font-mono text-slate-500 border-l-2 border-indigo-200 pl-3">
          Enter a value in any base. The matrix will automatically calculate and translate it to all other bases using BigInt precision.
        </p>

        <div className="bg-slate-50 border border-slate-200 p-6 rounded-sm space-y-8 relative overflow-hidden">
          {/* Blueprint background effect inside the container */}
          <div className="absolute inset-0 bg-blueprint opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputRow 
              label="Decimal" 
              base={10} 
              placeholder="e.g. 1337" 
              activeBase={activeBase}
              inputValue={inputValue}
              result={result}
              handleInputChange={handleInputChange}
              handleCopy={handleCopy}
            />
            <InputRow 
              label="Hexadecimal" 
              base={16} 
              placeholder="e.g. 539" 
              activeBase={activeBase}
              inputValue={inputValue}
              result={result}
              handleInputChange={handleInputChange}
              handleCopy={handleCopy}
            />
            <InputRow 
              label="Binary" 
              base={2} 
              placeholder="e.g. 10100111001" 
              activeBase={activeBase}
              inputValue={inputValue}
              result={result}
              handleInputChange={handleInputChange}
              handleCopy={handleCopy}
            />
            <InputRow 
              label="Octal" 
              base={8} 
              placeholder="e.g. 2471" 
              activeBase={activeBase}
              inputValue={inputValue}
              result={result}
              handleInputChange={handleInputChange}
              handleCopy={handleCopy}
            />
          </div>
          
        </div>
      </div>
    </div>
  );
}
