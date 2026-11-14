// Collections retain stable links and assets; prose arrays are replaced in full.
const collections = new Set(["publications", "experience", "projects", "items"]);
export function mergeTranslation(base, translated, key = "") {
  if (translated === undefined) return base;
  if (Array.isArray(translated)) {
    return collections.has(key)
      ? translated.map((entry, index) => mergeTranslation(base?.[index] ?? {}, entry))
      : translated;
  }
  if (translated && typeof translated === "object") {
    return Object.fromEntries(Object.keys({ ...base, ...translated }).map(name =>
      [name, mergeTranslation(base?.[name], translated[name], name)]));
  }
  return translated;
}
export function readLocale(search, stored) {
  const requested = new URLSearchParams(search).get("lang");
  return ["en", "zh"].includes(requested) ? requested : stored === "zh" ? "zh" : "en";
}
