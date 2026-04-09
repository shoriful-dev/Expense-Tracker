const formatterCache = new Map();

function getFormatter({ digits, maximumFractionDigits, minimumFractionDigits }) {
  const key = `${digits}:${maximumFractionDigits}:${minimumFractionDigits}`;
  const cached = formatterCache.get(key);
  if (cached) return cached;

  // Use 3-digit grouping (20,000). Switch digits via numbering system.
  const locale = digits === 'bn' ? 'en-US-u-nu-beng' : 'en-US';
  const nf = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'BDT',
    currencyDisplay: 'narrowSymbol', // ৳
    maximumFractionDigits,
    minimumFractionDigits,
  });
  formatterCache.set(key, nf);
  return nf;
}

export function formatBDT(
  value,
  { digits = 'bn', maximumFractionDigits = 2, minimumFractionDigits = 0 } = {},
) {
  const num = Number(value);
  const safe = Number.isFinite(num) ? num : 0;
  return getFormatter({ digits, maximumFractionDigits, minimumFractionDigits }).format(safe);
}

