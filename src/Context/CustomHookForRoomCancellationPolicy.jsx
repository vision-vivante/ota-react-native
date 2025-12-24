import dayjs from 'dayjs';
import {useMemo} from 'react';

export default function useCancellationPolicy(policyArray) {
  return useMemo(() => {
    if (!Array.isArray(policyArray) || policyArray.length === 0) {
      return 'Cancellation policy not available';
    }

    const firstPolicy = policyArray[0];

    const rawDate = firstPolicy.From || firstPolicy.FromDate;
    if (!rawDate) {
      return 'Cancellation date not available';
    }
    const fromDate = dayjs(rawDate).format('MMMM D, YYYY');

    const value = firstPolicy.Value ?? firstPolicy.Amount ?? null;
    const type =
      firstPolicy.Type?.toLowerCase() ||
      (firstPolicy.Amount !== undefined ? 'amount' : 'unknown');

    if (value === null) {
      return `Free cancellation until ${fromDate}`;
    }

    if (type === 'percentage') {
      return `Free cancellation until ${fromDate} with a {value}% charge after.`;
    } else if (type === 'amount') {
      return `Free cancellation until ${fromDate} with a fee of ${value.toFixed(
        2,
      )} after.`;
    } else {
      return `Free cancellation until ${fromDate} with a charge of ${value}`;
    }
  }, [policyArray]);
}
