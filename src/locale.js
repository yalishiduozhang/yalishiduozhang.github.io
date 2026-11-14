import { createContext, useContext } from "react";
import readerChinese from "../config/reader-zh.json";
export const LocaleContext = createContext(null);
export function useLocale() { return useContext(LocaleContext); }
export function useText() {
  const context = useContext(LocaleContext);
  return text => context?.locale === "zh" ? readerChinese[text] || text : text;
}
