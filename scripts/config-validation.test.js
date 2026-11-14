import test from "node:test";
import assert from "node:assert/strict";
import { loadConfigs, validateConfigs } from "./config-validation.js";
import { parseConfig } from "../src/utils/parseConfig.js";
test("current configuration and asset references are valid", () => {
  assert.deepEqual(validateConfigs(loadConfigs()), []);
});
test("JSONC supports comments without corrupting strings", () => {
  const source = '{ // heading\n "url": "https://example.com/*keep*/", /* note */ "value": 1 }';
  assert.equal(parseConfig(source, "theme.jsonc", true).url, "https://example.com/*keep*/");
  assert.throws(() => parseConfig(source, "content.json"), /content.json:1:/);
  assert.throws(() => parseConfig('{"value":}', "broken.json"), /broken.json:1:/);
});
test("missing required fields report their location", () => {
  const config = loadConfigs(); delete config["hero.json"].primaryLinks;
  assert.match(validateConfigs(config).join("\n"), /hero.json.*primaryLinks/);
});
test("duplicate publication IDs and orphaned previews are rejected", () => {
  const config = loadConfigs();
  config["publications.json"][1].id = config["publications.json"][0].id;
  config["publication-previews.json"].unknown = {template:"basic"};
  const errors = validateConfigs(config).join("\n");
  assert.match(errors, /duplicate ID/); assert.match(errors, /unknown: no publication/);
});
test("missing assets and out-of-range preview chart values are rejected", () => {
  const config = loadConfigs();
  config["publication-previews.json"].thinkleap = {template:"basic",rows:[{label:"Example",value:"2"}]};
  const errors = validateConfigs(config, () => false).join("\n");
  assert.match(errors, /asset not found/); assert.match(errors, /rows\/0\/value/);
});
test("unknown content keys and incomplete narrative previews are rejected", () => {
  const config = loadConfigs();
  config["publication-previews.json"].thinkleap = {template:"narrative"};
  assert.match(validateConfigs(config).join("\n"), /figure: required for narrative/);
  config["education.json"].enable = true;
  assert.match(validateConfigs(config).join("\n"), /additionalProperty.*enable/);
});
test("a minimal basic preview remains optional", () => {
  const config = loadConfigs();
  assert.deepEqual(validateConfigs(config), []);
  config["publication-previews.json"].thinkleap = {template:"basic",abstractExpanded:true};
  assert.deepEqual(validateConfigs(config), []);
});
