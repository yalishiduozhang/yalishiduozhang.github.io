import { escapeHtml } from './site-metadata.js';

export const homepageUrl = 'https://yalishiduozhang.github.io/';

function link(url, label) {
  const target = new URL(url, homepageUrl);
  if (!['https:', 'http:', 'mailto:'].includes(target.protocol)) return escapeHtml(label);
  return `<a href="${escapeHtml(target.href)}">${escapeHtml(label)}</a>`;
}

function segments(items) {
  return items.map(item => {
    const text = item.href ? link(item.href, item.text) : escapeHtml(item.text);
    return item.strong ? `<strong>${text}</strong>` : text;
  }).join('');
}

export function renderStaticProfile({ hero, about, publications, zh }) {
  const profiles = [...hero.socialLinks, ...hero.primaryLinks];
  const papers = publications.map(paper => {
    const translation = zh.publications.find(item => item.id === paper.id);
    return `<article>
      <h3>${link(paper.link, paper.title)}</h3>
      <p>${segments(paper.authors)}</p>
      <p>${escapeHtml(paper.venue)}</p>
      <p lang="en">${escapeHtml(paper.summary)}</p>
      ${translation?.summary ? `<p lang="zh-CN">${escapeHtml(translation.summary)}</p>` : ''}
      <p>${link(paper.link, 'Paper')}${paper.pdfUrl ? ` | ${link(paper.pdfUrl, 'PDF')}` : ''}${paper.codeUrl ? ` | ${link(paper.codeUrl, 'Code')}` : ''}</p>
    </article>`;
  }).join('\n');

  // This is visible to everyone until React replaces the root, including when JS fails.
  return `<main id="static-profile" style="max-width:900px;margin:32px auto;padding:24px;line-height:1.8;overflow-wrap:anywhere">
    <h1>${escapeHtml(hero.name)} / <span lang="zh-CN">${escapeHtml(zh.hero.name)}</span></h1>
    <p>${escapeHtml(hero.title)} / <span lang="zh-CN">${escapeHtml(zh.hero.title)}</span></p>
    <nav aria-label="Academic profiles">${profiles.map(item => link(item.url, item.label)).join(' | ')}</nav>
    <section aria-label="About">
      <h2>About / <span lang="zh-CN">个人简介</span></h2>
      ${zh.about.paragraphs.map(paragraph => `<p lang="zh-CN">${segments(paragraph)}</p>`).join('\n')}
      ${about.paragraphs.map(paragraph => `<p lang="en">${segments(paragraph)}</p>`).join('\n')}
    </section>
    <section aria-label="Research interests">
      <h2>Research Interests / <span lang="zh-CN">研究方向</span></h2>
      <p lang="en">${hero.descriptions.map(item => escapeHtml(item.text)).join(' · ')}</p>
      <p lang="zh-CN">${zh.hero.descriptions.map(item => escapeHtml(item.text)).join(' · ')}</p>
    </section>
    <section aria-label="Publications">
      <h2>Publications / <span lang="zh-CN">论文</span></h2>
      ${papers}
    </section>
  </main>`;
}

export function renderProfileSchema({ site, hero, zh }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${homepageUrl}#profile`,
    url: homepageUrl,
    name: site.title,
    inLanguage: ['en', 'zh-CN'],
    mainEntity: {
      '@type': 'Person',
      '@id': `${homepageUrl}#person`,
      name: hero.name,
      alternateName: zh.hero.name,
      url: homepageUrl,
      description: site.description,
      image: `${homepageUrl}portrait.png`,
      affiliation: {
        '@type': 'CollegeOrUniversity',
        name: hero.title,
        alternateName: zh.hero.title,
      },
      knowsAbout: hero.descriptions.map(item => item.text),
      sameAs: hero.socialLinks.map(item => item.url),
    },
  };
  return JSON.stringify(data).replaceAll('<', '\\u003c');
}

export function renderProfileHtml(html, content) {
  return html
    .replace('<!-- STATIC_PROFILE -->', () => renderStaticProfile(content))
    .replace('<!-- PROFILE_SCHEMA -->', () => renderProfileSchema(content));
}
