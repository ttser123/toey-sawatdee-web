import * as parser from 'cron-parser';

export interface CronResult {
  isValid: boolean;
  error?: string;
  nextExecutions: string[];
  description?: string;
}

export function parseCronExpression(cronStr: string, count: number = 5): CronResult {
  if (!cronStr.trim()) {
    return { isValid: false, nextExecutions: [] };
  }

  try {
    // Check for different exports depending on bundler and cron-parser version
    const parse = parser.parseExpression 
               || (parser as any).default?.parseExpression 
               || (parser as any).CronExpressionParser?.parse
               || (parser as any).default?.parse;
               
    if (!parse) throw new Error('Cron parser initialization failed.');
    
    const interval = parse(cronStr);
    const nextExecutions: string[] = [];

    for (let i = 0; i < count; i++) {
      nextExecutions.push(interval.next().toString());
    }

    return {
      isValid: true,
      nextExecutions,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: err.message,
      nextExecutions: [],
    };
  }
}
