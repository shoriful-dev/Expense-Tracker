import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  loadPreferences,
  onPreferencesChanged,
  savePreferences,
} from '../utils/preferences';

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(() => loadPreferences());

  useEffect(() => onPreferencesChanged(setPrefs), []);

  const api = useMemo(() => {
    const setDigits = digits => {
      const next = { ...prefs, digits };
      savePreferences(next);
      window.dispatchEvent(new Event('preferences:changed'));
      setPrefs(next);
    };
    return { prefs, setDigits };
  }, [prefs]);

  return (
    <PreferencesContext.Provider value={api}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return ctx;
}

