import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { escapeHtml, renderSiteMetadata } from './site-metadata.js';
import { renderProfileHtml, renderProfileSchema, renderStaticProfile } from './static-profile.js';

function fixture() {
  return Object.fromEntries(['site', 'hero', 'about', 'publications', 'zh'].map(name => [
    name, JSON.parse(fs.readFileSync(new URL(`../config/${name}.json`, import.meta.url), 'utf8')),
  ]));
}

test('initial HTML exposes both names and every academic profile without JavaScript', () => {
  const content = fixture();
  const template = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const html = renderProfileHtml(renderSiteMetadata(template, content.site), content);
  const body = html.match(/<body>([\s\S]*)<\/body>/)[1];
  assert.match(body, /<div id="root"><main/);
  assert.match(body, /<h1>Xun Zhang/);
  assert.match(body, /章勋/);
  assert.match(body, /福州大学/);
  assert.match(body, /Fuzhou University/);
  for (const profile of content.hero.socialLinks) {
    assert.ok(body.includes(`href="${escapeHtml(new URL(profile.url).href)}">${escapeHtml(profile.label)}</a>`));
  }
  assert.doesNotMatch(html, /STATIC_PROFILE|PROFILE_SCHEMA|%SITE_|<noscript>/);
});

test('publication metadata, author order and real links survive text-only retrieval', () => {
  const content = fixture();
  const html = renderStaticProfile(content);
  for (const paper of content.publications) {
    assert.ok(html.includes(escapeHtml(paper.title)));
    const article = html.slice(html.indexOf(escapeHtml(paper.title))).split('</article>')[0];
    const text = article.replace(/<[^>]+>/g, '');
    assert.ok(text.includes(escapeHtml(paper.authors.map(author => author.text).join(''))));
    assert.ok(article.includes(`href="https://yalishiduozhang.github.io${paper.pdfUrl}"`));
    assert.ok(article.includes(`href="${escapeHtml(paper.codeUrl)}"`));
    assert.ok(article.includes(escapeHtml(paper.venue)));
  }
});

test('generated identity follows edited configuration and does not claim future affiliation', () => {
  const content = fixture();
  content.hero.socialLinks[0].url = 'https://example.org/updated-profile';
  const data = JSON.parse(renderProfileSchema(content));
  assert.equal(data['@type'], 'ProfilePage');
  assert.equal(data.mainEntity['@type'], 'Person');
  assert.equal(data.mainEntity.alternateName, content.zh.hero.name);
  assert.equal(data.mainEntity.affiliation.name, 'Fuzhou University');
  assert.deepEqual(data.mainEntity.sameAs, content.hero.socialLinks.map(item => item.url));
  assert.ok(renderStaticProfile(content).includes('https://example.org/updated-profile'));
});

test('configuration text cannot terminate JSON-LD or inject markup and script links', () => {
  const content = fixture();
  content.hero.name = '</script><script>alert("x")</script>$&';
  content.hero.primaryLinks = [{ label: '<unsafe>', url: 'javascript:alert(1)' }];
  const html = renderProfileHtml('<!-- STATIC_PROFILE --><script type="application/ld+json"><!-- PROFILE_SCHEMA --></script>', content);
  assert.equal(html.match(/<script/g).length, 1);
  assert.doesNotMatch(html, /href="javascript:/);
  assert.ok(html.includes('&lt;unsafe&gt;'));
  assert.ok(html.includes('&lt;/script&gt;'));
  assert.equal(JSON.parse(renderProfileSchema(content)).mainEntity.name, content.hero.name);
  assert.ok(html.includes('$&'));
});

test('Chinese publication summaries follow IDs, not array positions', () => {
  const content = fixture();
  content.zh.publications.reverse();
  const html = renderStaticProfile(content);
  for (const paper of content.publications) {
    const article = html.slice(html.indexOf(escapeHtml(paper.title))).split('</article>')[0];
    assert.ok(article.includes(escapeHtml(content.zh.publications.find(item => item.id === paper.id).summary)));
  }
});
