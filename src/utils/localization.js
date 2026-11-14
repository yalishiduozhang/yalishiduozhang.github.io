// Collections retain stable links and assets; prose arrays are replaced in full.
const collections = new Set(["publications", "experience", "projects", "items"]);
export function mergeTranslation(base, translated, key = "") {
  if (translated === undefined) return base;
  if (Array.isArray(translated)) {
    return collections.has(key)
      ? base.map((entry, index) => mergeTranslation(entry, translated[index]))
      : translated;
  }
  if (translated && typeof translated === "object") {
    return Object.fromEntries(Object.entries(base).map(([name, value]) =>
      [name, mergeTranslation(value, translated[name], name)]));
  }
  return translated;
}
export function readLocale(search, stored) {
  const requested = new URLSearchParams(search).get("lang");
  return ["en", "zh"].includes(requested) ? requested : stored === "zh" ? "zh" : "en";
}
