#!/usr/bin/env python3
"""Recover maintainable Hexo posts from the published static site.

The original Hexo source repository is not available in the GitHub Pages
repository. This script extracts metadata from search.xml and each generated
post page, then converts the rendered article HTML back to Markdown with
pandoc. It is intentionally conservative: dates, slugs and external image URLs
are preserved so regenerated permalinks match the current site.
"""

from __future__ import annotations

import html
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[1]
STATIC_SITE = ROOT.parent / "yalishiduozhang.github.io"
POST_DIR = ROOT / "source" / "_posts"


def yaml_quote(value: str) -> str:
    value = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{value}"'


def yaml_list(name: str, values: list[str]) -> list[str]:
    if not values:
        return []
    lines = [f"{name}:"]
    lines.extend(f"  - {yaml_quote(value)}" for value in values)
    return lines


def strip_tags(value: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", value)).strip()


def extract_first(pattern: str, text: str, default: str = "") -> str:
    match = re.search(pattern, text, re.S)
    return html.unescape(match.group(1)).strip() if match else default


def extract_article_html(page: str) -> str:
    match = re.search(r'<article\b(?=[^>]*\bid=["\']article-container["\'])[^>]*>', page, re.S)
    if not match:
        raise ValueError("article-container not found")

    start = match.end()
    end = page.find("</article>", start)
    if end < 0:
        raise ValueError("closing article tag not found")

    fragment = page[start:end]
    fragment = re.sub(r"^\s*<header>.*?</header>", "", fragment, flags=re.S)
    return fragment.strip()


def repair_lazy_images(fragment: str) -> str:
    def replace_img(match: re.Match[str]) -> str:
        tag = match.group(0)
        lazy = re.search(r'\sdata-lazy-src=("|\')([^"\']+)\1', tag)
        if not lazy:
            return tag
        url = lazy.group(2)
        tag = re.sub(r'\ssrc=("|\')data:image/gif;[^"\']*\1', "", tag)
        tag = re.sub(r'\sdata-lazy-src=("|\')[^"\']+\1', "", tag)
        if not re.search(r'\ssrc=("|\')', tag):
            tag = tag.replace("<img", f'<img src="{html.escape(url, quote=True)}"', 1)
        return tag

    return re.sub(r"<img\b[^>]*>", replace_img, fragment, flags=re.S)


def repair_highlight_figures(fragment: str) -> str:
    pattern = re.compile(
        r'<figure class="highlight ([^"]+)">\s*<table>.*?'
        r'<td class="code"><pre>(.*?)</pre></td>.*?</table>\s*</figure>',
        re.S,
    )

    def replace_figure(match: re.Match[str]) -> str:
        lang = match.group(1).strip().split()[0]
        code_html = match.group(2).replace("<br>", "\n")
        code = strip_tags(code_html).rstrip()
        escaped = html.escape(code)
        return f'<pre><code class="language-{lang}">{escaped}\n</code></pre>'

    return pattern.sub(replace_figure, fragment)


def clean_fragment(fragment: str) -> str:
    fragment = repair_lazy_images(fragment)
    fragment = repair_highlight_figures(fragment)
    fragment = re.sub(r'<a href="#[^"]+" class="headerlink" title="[^"]*"></a>', "", fragment)
    return fragment.strip()


def html_to_markdown(fragment: str) -> str:
    proc = subprocess.run(
        ["pandoc", "-f", "html", "-t", "gfm-raw_html", "--wrap=none"],
        input=fragment,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if proc.returncode != 0:
        print(proc.stderr, file=sys.stderr)
        return fragment
    return proc.stdout.strip() + "\n"


def load_search_metadata() -> list[dict[str, object]]:
    tree = ET.parse(STATIC_SITE / "search.xml")
    entries = []
    for entry in tree.getroot().findall("entry"):
        link_el = entry.find("link")
        link = link_el.attrib.get("href", "") if link_el is not None else ""
        title = (entry.findtext("title") or "").strip()
        categories = [c.text.strip() for c in entry.findall("./categories/category") if c.text and c.text.strip()]
        tags = [t.text.strip() for t in entry.findall("./tags/tag") if t.text and t.text.strip()]
        entries.append({"title": title, "link": link, "categories": categories, "tags": tags})
    return entries


def post_path_from_link(link: str) -> tuple[Path, str]:
    decoded = unquote(link.strip("/"))
    parts = decoded.split("/")
    if len(parts) < 4:
        raise ValueError(f"unexpected post link: {link}")
    slug = parts[-1]
    html_path = STATIC_SITE.joinpath(*parts, "index.html")
    return html_path, slug


def front_matter(metadata: dict[str, object], page: str, slug: str) -> str:
    title = str(metadata["title"])
    description = extract_first(r'<meta name="description" content="([^"]*)"', page)
    cover = extract_first(r'<meta property="og:image" content="([^"]+)"', page)
    date = extract_first(r'<time class="post-meta-date-created"[^>]+title="发表于 ([^"]+)"', page)
    updated = extract_first(r'<time class="post-meta-date-updated"[^>]+title="更新于 ([^"]+)"', page)

    lines = ["---", f"title: {yaml_quote(title)}"]
    if date:
        lines.append(f"date: {date}")
    if updated:
        lines.append(f"updated: {updated}")
    lines.extend(yaml_list("categories", metadata.get("categories", [])))
    lines.extend(yaml_list("tags", metadata.get("tags", [])))
    if cover:
        lines.append(f"cover: {yaml_quote(cover)}")
        lines.append(f"top_img: {yaml_quote(cover)}")
    if description:
        lines.append(f"description: {yaml_quote(description)}")
    lines.append("comments: false")
    lines.append("mathjax: true")
    lines.append("katex: false")
    lines.append(f"abbrlink: {yaml_quote(slug)}")
    lines.append("---")
    return "\n".join(lines) + "\n\n"


def migrate_post(metadata: dict[str, object]) -> Path:
    html_path, slug = post_path_from_link(str(metadata["link"]))
    page = html_path.read_text(encoding="utf-8")
    fragment = clean_fragment(extract_article_html(page))
    markdown = html_to_markdown(fragment)
    output = POST_DIR / f"{slug}.md"
    output.write_text(front_matter(metadata, page, slug) + markdown, encoding="utf-8")
    return output


def main() -> int:
    if not STATIC_SITE.exists():
        print(f"static site not found: {STATIC_SITE}", file=sys.stderr)
        return 1
    POST_DIR.mkdir(parents=True, exist_ok=True)
    outputs = [migrate_post(metadata) for metadata in load_search_metadata()]
    for path in outputs:
        print(path.relative_to(ROOT))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
