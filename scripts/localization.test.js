import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { loadConfigs, validateConfigs } from "./config-validation.js";
import { mergeTranslation, readLocale } from "../src/utils/localization.js";
const zh = JSON.parse(fs.readFileSync(new URL("../config/zh.json", import.meta.url)));
test("Chinese content satisfies the same schema and retains publication links, authors and citations", () => {
  const configs = loadConfigs();
  for (const [key, translation] of Object.entries(zh)) {
    configs[key + ".json"] = mergeTranslation(configs[key + ".json"], translation, key);
  }
  assert.deepEqual(validateConfigs(configs), []);
  assert.match(configs["hero.json"].title, /福州大学/);
  assert.match(configs["about.json"].paragraphs[0].map(s => s.text).join(""), /2027/);
  assert.equal(configs["publications.json"][2].authors.at(-1).text.includes("Guorui Xie"), true);
  assert.match(configs["publications.json"][2].citation, /Xie, Guorui/);
  assert.equal(configs["publications.json"][0].pdfUrl, "/papers/thinkleap.pdf");
  assert.equal(configs["hero.json"].socialLinks.length, 5);
});
test("translated collections retain identity and complete text coverage", () => {
  const configs = loadConfigs();
  for (const key of ["publications", "experience", "projects"]) {
    assert.equal(zh[key].length, configs[key + ".json"].length);
  }
  assert.deepEqual(zh.publications.map(p => p.id), configs["publications.json"].map(p => p.id));
  for (const key of ["education", "awards"]) {
    assert.equal(zh[key].items.length, configs[key + ".json"].items.length);
  }
  const ui = JSON.parse(fs.readFileSync(new URL("../config/interface.json", import.meta.url)));
  assert.deepEqual(Object.keys(ui.en).sort(), Object.keys(ui.zh).sort());
  assert.deepEqual(Object.keys(ui.en.nav).sort(), Object.keys(ui.zh.nav).sort());
});
test("prose arrays are replaced without leaking trailing English sentences", () => {
  const base = { paragraphs: [[{text:"English"}, {text:"extra"}]], items:[{title:"Old", year:"2026"}] };
  assert.deepEqual(mergeTranslation(base, {paragraphs:[[{text:"中文"}]], items:[{title:"新"}]}), {paragraphs:[[{text:"中文"}]],items:[{title:"新",year:"2026"}]});
});
test("explicit language URLs override preferences and unknown values are safe", () => {
  assert.equal(readLocale("?lang=en", "zh"), "en");
  assert.equal(readLocale("?lang=zh", "en"), "zh");
  assert.equal(readLocale("", "zh"), "zh");
  assert.equal(readLocale("?lang=invalid", null), "en");
});

test("removing translated collection entries never restores trailing English entries", () => {
  const base = { items: [{ title: "Keep", year: "2024" }, { title: "Remove" }] };
  assert.deepEqual(mergeTranslation(base, { items: [{ title: "保留" }] }), { items: [{ title: "保留", year: "2024" }] });
  assert.deepEqual(mergeTranslation(base, { items: [] }), { items: [] });
});
