import { useState, useEffect } from 'react';
import { parseCronExpression, CronResult } from '@/lib/cron-utils';

export function useCronTool() {
  const [cronExpression, setCronExpression] = useState<string>('*/15 * * * *');
  const [result, setResult] = useState<CronResult | null>(null);
  const [upcomingCount, setUpcomingCount] = useState<number>(10);

  useEffect(() => {
    if (!cronExpression.trim()) {
      setResult(null);
      return;
    }
    
    // Slight debounce for UX
    const timer = setTimeout(() => {
      const parsed = parseCronExpression(cronExpression, upcomingCount);
      setResult(parsed);
    }, 300);

    return () => clearTimeout(timer);
  }, [cronExpression, upcomingCount]);

  return {
    cronExpression,
    setCronExpression,
    result,
    upcomingCount,
    setUpcomingCount
  };
}
