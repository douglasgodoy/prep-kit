import { createContext, useContext, useState, useCallback } from "react";
import { translations } from "./translations.js";

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    try {
      return localStorage.getItem("iprep_locale") || "en";
    } catch {
      return "en";
    }
  });

  const t = useCallback((key, params) => {
    const str = translations[locale]?.[key] || translations.en[key] || key;
    if (!params) return str;
    return Object.entries(params).reduce(
      (result, [k, v]) => result.replace(`{${k}}`, v),
      str
    );
  }, [locale]);

  const changeLocale = useCallback((newLocale) => {
    setLocale(newLocale);
    try {
      localStorage.setItem("iprep_locale", newLocale);
    } catch {}
  }, []);

  return (
    <I18nContext.Provider value={{ locale, t, changeLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
