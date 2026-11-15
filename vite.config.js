import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import { renderSiteMetadata } from './scripts/site-metadata.js'
import { renderProfileHtml } from './scripts/static-profile.js'
import { arxivDevPlugin } from './scripts/arxiv-dev.js'
import { optimizeImagesPlugin } from './scripts/optimize-images.js'

const buildDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date()).replaceAll('-', '/')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), arxivDevPlugin(), optimizeImagesPlugin(), {
    name: 'site-metadata',
    transformIndexHtml(html) {
      const content = Object.fromEntries(['site', 'hero', 'about', 'publications', 'zh'].map(name => [
        name, JSON.parse(fs.readFileSync(new URL(`./config/${name}.json`, import.meta.url), 'utf8')),
      ]))
      return renderProfileHtml(renderSiteMetadata(html, content.site), content)
    },
  }],
  define: {
    'import.meta.env.VITE_BUILD_DATE': JSON.stringify(buildDate),
  },
  server:{
    host: '0.0.0.0',
  },
  base: '/'
})
