import { useEffect, useState } from "react";
import { LocaleContext } from "../locale";
import { getSiteContent } from "../siteConfig";
import { readLocale } from "../utils/localization";
import labels from "../../config/interface.json";

function initialLocale() {
  let stored;
  try { stored = localStorage.getItem("xun-language"); } catch { /* Storage may be disabled. */ }
  return readLocale(window.location.search, stored);
}
export default function LanguageProvider({ children }) {
  const [locale, updateLocale] = useState(initialLocale);
  const content = getSiteContent(locale);
  const ui = labels[locale];
  function setLocale(next) {
    updateLocale(next);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState(null, "", url);
  }
  useEffect(() => {
    const handleHistory = () => updateLocale(initialLocale());
    window.addEventListener("popstate", handleHistory);
    return () => window.removeEventListener("popstate", handleHistory);
  }, []);
  useEffect(() => {
    document.documentElement.lang = content.site.language;
    document.title = content.site.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", content.site.description);
    try { localStorage.setItem("xun-language", locale); } catch { /* The switch also works without persistence. */ }
  }, [locale, content.site.language, content.site.title, content.site.description]);
  return <LocaleContext.Provider value={{ locale, setLocale, content, ui }}>{children}</LocaleContext.Provider>;
}
