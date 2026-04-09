const formatterCache = new Map();

function getDateFormatter(digits) {
  const key = digits === 'bn' ? 'bn' : 'en';
  const cached = formatterCache.get(key);
  if (cached) return cached;

  const locale = digits === 'bn' ? 'en-US-u-nu-beng' : 'en-US';
  const df = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  formatterCache.set(key, df);
  return df;
}

export function formatDate(value, { digits = 'bn' } = {}) {
  const d = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(d.getTime())) return '';
  return getDateFormatter(digits).format(d);
}

