export interface BaseConversionResult {
  binary: string;
  octal: string;
  decimal: string;
  hex: string;
  isValid: boolean;
  error?: string;
}

export type BaseType = 2 | 8 | 10 | 16;

/**
 * Validates if the string only contains valid characters for the given base
 */
function isValidForBase(value: string, base: BaseType): boolean {
  if (!value) return true;
  
  const valueClean = value.trim().toLowerCase();
  // Allow optional negative sign
  const isNegative = valueClean.startsWith('-');
  const checkValue = isNegative ? valueClean.slice(1) : valueClean;
  
  if (!checkValue) return false;

  switch (base) {
    case 2: return /^[01]+$/.test(checkValue);
    case 8: return /^[0-7]+$/.test(checkValue);
    case 10: return /^[0-9]+$/.test(checkValue);
    case 16: return /^[0-9a-f]+$/.test(checkValue);
    default: return false;
  }
}

/**
 * Converts a string from a specific base to all other bases using BigInt for precision
 */
export function convertBases(value: string, fromBase: BaseType): BaseConversionResult {
  if (!value.trim()) {
    return {
      binary: '',
      octal: '',
      decimal: '',
      hex: '',
      isValid: true
    };
  }

  // Remove spaces, commas, and underscores often used for formatting
  const sanitizedValue = value.replace(/[\s,_]/g, '');

  if (!isValidForBase(sanitizedValue, fromBase)) {
    return {
      binary: '',
      octal: '',
      decimal: '',
      hex: '',
      isValid: false,
      error: `Invalid characters for base ${fromBase}`
    };
  }

  try {
    // Determine sign
    const isNegative = sanitizedValue.startsWith('-');
    const absoluteStr = isNegative ? sanitizedValue.slice(1) : sanitizedValue;
    
    // Parse to BigInt using custom parser if not base 10, because BigInt() constructor 
    // accepts decimal or specific prefixes like 0x, 0o, 0b.
    let bigValue: bigint;
    
    if (fromBase === 10) {
      bigValue = BigInt(absoluteStr);
    } else {
      // Manual parse for BigInt
      bigValue = parseBigIntBase(absoluteStr, fromBase);
    }

    if (isNegative) {
      bigValue = -bigValue;
    }

    return {
      binary: bigValue.toString(2),
      octal: bigValue.toString(8),
      decimal: bigValue.toString(10),
      hex: bigValue.toString(16).toUpperCase(),
      isValid: true
    };
  } catch (error: any) {
    return {
      binary: '',
      octal: '',
      decimal: '',
      hex: '',
      isValid: false,
      error: 'Value too large or invalid'
    };
  }
}

function parseBigIntBase(str: string, base: number): bigint {
  let res = BigInt(0);
  const baseBig = BigInt(base);
  for (let i = 0; i < str.length; i++) {
    const char = str[i].toLowerCase();
    const val = parseInt(char, base);
    if (isNaN(val)) throw new Error('Invalid character');
    res = res * baseBig + BigInt(val);
  }
  return res;
}
