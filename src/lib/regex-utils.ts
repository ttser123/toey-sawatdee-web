export interface MatchResult {
  match: string;
  index: number;
  groups: string[];
}

export interface RegexEvaluation {
  isValid: boolean;
  error?: string;
  matches: MatchResult[];
  executionTimeMs: number;
}

export function evaluateRegex(pattern: string, flags: string, testString: string): RegexEvaluation {
  const start = performance.now();
  
  if (!pattern) {
    return { isValid: false, matches: [], executionTimeMs: 0 };
  }

  try {
    const regex = new RegExp(pattern, flags);
    const matches: MatchResult[] = [];
    
    // Safety limit to prevent infinite loops with global flag on empty strings
    let matchLimit = 1000;
    
    if (flags.includes('g')) {
      let match;
      // RegExp.exec is stateful when 'g' flag is set
      while ((match = regex.exec(testString)) !== null && matchLimit > 0) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1)
        });
        
        // Prevent infinite loops on zero-width matches
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        matchLimit--;
      }
    } else {
      const match = regex.exec(testString);
      if (match) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1)
        });
      }
    }

    const end = performance.now();
    return {
      isValid: true,
      matches,
      executionTimeMs: Math.round((end - start) * 100) / 100
    };
  } catch (error: any) {
    return {
      isValid: false,
      error: error.message || 'Invalid Regular Expression',
      matches: [],
      executionTimeMs: 0
    };
  }
}
