# Xun Zhang / 章勋

Bilingual academic homepage for **https://yalishiduozhang.github.io/**.

Built directly from [Anleeno/anleeno-academic](https://github.com/Anleeno/anleeno-academic), upstream commit `763fd7a64c2fbc9434dc6f04f4e0f64561faaee2`. The upstream two-column layout, theme, navigation, publication previews, PDF reader, timeline and project components are retained. Personal data and media have been replaced. Fonts are bundled locally.

## Local development

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open `http://localhost:5173/`. Use the header language button, `?lang=en` or `?lang=zh`. A chosen language is remembered in the current browser.

## Content editing

- `config/hero.json`: identity, portrait, contact and academic profiles.
- `config/about.json`, `news.json`, `experience.json`, `education.json`, `awards.json`, `projects.json`: English content.
- `config/publications.json`: verified titles, complete author lists, publication links and BibTeX.
- `config/zh.json`: Chinese content. Collection entries correspond to their English entries in the same order.
- `config/interface.json` and `reader-zh.json`: interface translations.
- `config/theme.jsonc`: the original template palette.
- `src/css/Personalization.css`: small bilingual and accessibility additions.
- `src/assets/`: cat avatar, institution emblems, user-supplied paper method figures, wordmark and project diagrams. The legacy CV portrait and mask are excluded from production assets.
- `public/papers/`: published papers from ACL Anthology for the same-origin PDF reader.

The original private CV is not included. The public website omits its phone number and political affiliation. The research summaries are paraphrases; the PDF files contain the original papers. Institution emblems identify internship affiliations; see CONTENT-LICENSE.md for sources.

## Verification

```sh
npm run lint
npm test
npm run build
```

The test suite includes configuration, bilingual data consistency, language selection, modal behavior and the template's PDF utilities.

## Publish

Source is on `academic-source`; the compiled site is published from `main` using the existing GitHub Pages configuration. The earlier Hexo source branch is independent.

After committing source changes and pushing `academic-source`:

```sh
npm run deploy
```

This checks and builds the site, clones the current remote `main` into a temporary directory, preserves it in a timestamped backup branch, commits the new static output, and pushes a normal fast-forward update. It requires GitHub CLI (`gh`) to be authenticated as an account with repository write access. It does not force-push. Keep the local source commit pushed before deploying, so generated output can be traced to its source.

Each replacement preserves the previous site under `backup/main-<timestamp>-before-academic`; the deployment command prints the exact branch name. GitHub Pages may take a few minutes to finish publishing.

## Provenance

See [CONTENT-SOURCES.md](./CONTENT-SOURCES.md) for factual sources and [CONTENT-LICENSE.md](./CONTENT-LICENSE.md) for media attribution. The template's MIT license is preserved in [LICENSE](./LICENSE).
