# Content configuration

The English content uses the upstream template's JSON schema in `schemas/site.schema.json`. Chinese translations are in `zh.json`; UI labels are in `interface.json` and `reader-zh.json`.

For `publications`, `experience`, `projects`, and the `items` arrays under education/awards, translations merge by position, using the translated list's length: removed entries never reappear in English. Keep matching entries in the same order and synchronize both languages after editing. Publication IDs must match. Links, author lists, citations and asset references remain shared unless explicitly overridden. Prose arrays such as paragraphs, tags and news segments replace the English arrays completely.

Run `npm test` after editing bilingual collections. Run `npm run build` to validate the English schema, asset references and local PDF paths.

Paper titles and author names stay in their published English form in both languages. `abstract` contains a short research overview, not a verbatim abstract. The paper preview label reflects this.

To add a publication, update `publications.json`, add the translated summary/tags in `zh.json`, and place the paper in `public/papers/`. `pdfUrl` may be a same-origin path; `link` should point to the official publication record. Use `codeUrl` only for a verified repository.

Education and awards use the original template's `enabled` toggles. Daily/related paper recommendations are disabled. No citation count is guessed or scraped.
