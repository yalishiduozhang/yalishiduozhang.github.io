# yalishiduozhang.github.io Hexo Source

This directory is the maintainable Hexo source for `https://yalishiduozhang.github.io/`.

The adjacent `../yalishiduozhang.github.io/` directory is the published GitHub Pages repository content recovered from `main`. Keep that directory as the current online static-site backup unless you intentionally deploy a new build.

## Environment

- Ubuntu 22.04
- Node.js `v24.5.0` via nvm
- Global `hexo-cli` `4.3.2`
- Project Hexo `8.1.2`
- Theme `hexo-theme-anzhiyu` `1.7.0`

## Common Commands

```bash
npm install
npm run clean
npm run build
npm run server
```

Preview locally at `http://localhost:4000/` after `npm run server`.

## Writing

Create a new post with:

```bash
hexo new post "文章标题"
```

Posts live under `source/_posts/`. The recovered legacy posts use `abbrlink` values matching the current public URLs, so their paths stay stable after regeneration.

## Deployment

Deployment is configured in `_config.yml`:

```yaml
deploy:
  type: git
  repo: git@github.com:yalishiduozhang/yalishiduozhang.github.io.git
  branch: main
```

Before deploying, create or update a backup branch/tag from the published repository. Then run:

```bash
npm run clean
npm run build
npm run deploy
```

Do not run deploy until the local preview has been checked.

## Recovery Notes

The original Hexo source was not present in the GitHub Pages `main` branch. The current source was reconstructed from the generated static site with `tools/migrate_static_posts.py`, preserving article titles, dates, categories, tags, covers and slugs where recoverable.
