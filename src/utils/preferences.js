const KEY = 'preferences_v1';

const defaultPrefs = {
  digits: 'bn', // 'bn' | 'en'
  currency: 'BDT', // future-proof
};

export function loadPreferences() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaultPrefs };
    const parsed = JSON.parse(raw);
    return { ...defaultPrefs, ...(parsed || {}) };
  } catch {
    return { ...defaultPrefs };
  }
}

export function savePreferences(next) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function subscribePreferences(cb) {
  const handler = e => {
    if (e?.key === KEY) cb(loadPreferences());
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

export function setDigits(digits) {
  const next = { ...loadPreferences(), digits };
  savePreferences(next);
  // notify same tab listeners
  window.dispatchEvent(new Event('preferences:changed'));
  return next;
}

export function onPreferencesChanged(cb) {
  const handler = () => cb(loadPreferences());
  window.addEventListener('preferences:changed', handler);
  return () => window.removeEventListener('preferences:changed', handler);
}

