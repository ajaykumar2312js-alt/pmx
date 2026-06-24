import { formatDistanceToNow } from 'date-fns';
import { toUtcDate } from './dateUtils';

export const formatters = {
  number: (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  },

  relativeTime: (utcStr: string) => {
    try {
      const date = toUtcDate(utcStr);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return utcStr;
    }
  },
};
