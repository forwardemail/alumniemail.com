#!/usr/bin/env node
/*
  Static site generator for alumniemail.com (no dependencies).

  Reads content/*.md (front matter + a small Markdown subset) and writes:
    - index.html and /<slug>/index.html for every page, plus 404.html
    - /<slug>/index.md (clean Markdown copy of each page)
    - sitemap.xml, robots.txt, llms.txt, llms-full.txt, site.webmanifest
    - css/style.min.css (minified from css/style.css)

  GitHub Pages serves the committed output as is, so run this after editing
  content or styles and commit the result:  node scripts/build.js
*/

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');

const SITE = {
  url: 'https://alumniemail.com',
  name: 'AlumniEmail',
  repo: 'https://github.com/forwardemail/alumniemail.com',
  ogImage: '/images/og-image.jpg',
  ogImageAlt: 'AlumniEmail: lifetime alumni email forwarding for universities, from the Forward Email team',
  themeColor: '#1a365d',
  summary:
    'Guides for university IT and alumni relations teams on lifetime alumni email forwarding with Forward Email: how it works, DNS setup, migration from Google Workspace or Microsoft 365, sourced costs and a published university case study.'
};

const ORG = {
  '@type': 'Organization',
  '@id': 'https://forwardemail.net/#organization',
  name: 'Forward Email',
  url: 'https://forwardemail.net',
  logo: 'https://forwardemail.net/img/logo-square-180x180.png',
  sameAs: [
    'https://github.com/forwardemail',
    'https://x.com/fwdemail',
    'https://www.youtube.com/forwardemail',
    'https://www.reddit.com/r/forwardemail/'
  ],
  contactPoint: [
    { '@type': 'ContactPoint', contactType: 'customer support', email: 'support@forwardemail.net', url: 'https://forwardemail.net/en/faq' },
    { '@type': 'ContactPoint', contactType: 'security', email: 'security@forwardemail.net', url: 'https://forwardemail.net/en/security' }
  ]
};

// ---------------------------------------------------------------------------
// Helpers

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z\d\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const stripInline = (s) =>
  String(s)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1');

const absUrl = (href) => (href.startsWith('/') ? SITE.url + href : href);

function parseFrontMatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) throw new Error('missing front matter');
  const meta = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if (/^\d+$/.test(value)) value = Number(value);
    else if (value === 'true' || value === 'false') value = value === 'true';
    meta[key] = value;
  }

  return { meta, body: src.slice(m[0].length) };
}

// ---------------------------------------------------------------------------
// Inline Markdown

function inline(text) {
  const codes = [];
  let s = String(text).replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  });
  s = escapeHtml(s);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => `<a href="${href}">${label}</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${escapeHtml(codes[Number(i)])}</code>`);
  return s;
}

// ---------------------------------------------------------------------------
// Block Markdown

function parseBlocks(lines) {
  const tokens = [];
  let pendingCaption = null;
  let i = 0;
  const isBlank = (l) => l === undefined || l.trim() === '';

  while (i < lines.length) {
    const line = lines[i];

    if (isBlank(line)) {
      i++;
      continue;
    }

    // Fenced code
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      const code = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) code.push(lines[i++]);
      i++;
      tokens.push({ type: 'code', lang: fence[1], code: code.join('\n') });
      continue;
    }

    // Container  :::name ... :::
    const container = line.match(/^:::(\w[\w-]*)\s*$/);
    if (container) {
      const inner = [];
      let depth = 1;
      i++;
      while (i < lines.length) {
        if (/^:::\w/.test(lines[i])) depth++;
        else if (/^:::\s*$/.test(lines[i])) {
          depth--;
          if (depth === 0) break;
        }

        inner.push(lines[i++]);
      }

      i++;
      tokens.push({ type: 'container', name: container[1], children: parseBlocks(inner) });
      continue;
    }

    // Heading
    const heading = line.match(/^(#{2,4})\s+(.+?)\s*$/);
    if (heading) {
      // Optional decorative icon: ### Heading {icon=/images/svg/name.svg}
      const iconMatch = heading[2].match(/\s*\{icon=([^}]+)\}$/);
      const text = iconMatch ? heading[2].slice(0, iconMatch.index) : heading[2];
      tokens.push({
        type: 'heading',
        level: heading[1].length,
        text,
        id: slugify(stripInline(text)),
        icon: iconMatch ? iconMatch[1] : null
      });
      i++;
      continue;
    }

    // Raw HTML block (HTML output only)
    if (line.startsWith('<')) {
      const html = [];
      while (!isBlank(lines[i])) html.push(lines[i++]);
      tokens.push({ type: 'html', html: html.join('\n') });
      continue;
    }

    // Table caption: a "Table: ..." line directly above a table
    if (/^Table:\s/.test(line) && (lines[i + 1] || '').startsWith('|')) {
      pendingCaption = line.replace(/^Table:\s*/, '');
      i++;
      continue;
    }

    // Table
    if (line.startsWith('|') && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) {
      const cells = (l) =>
        l
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => c.trim());
      const head = cells(line);
      const rows = [];
      i += 2;
      while (i < lines.length && lines[i].startsWith('|')) rows.push(cells(lines[i++]));
      tokens.push({ type: 'table', head, rows, caption: pendingCaption });
      pendingCaption = null;
      continue;
    }

    // Lists
    const listMatch = line.match(/^(-|\d+\.)\s+/);
    if (listMatch) {
      const ordered = listMatch[1] !== '-';
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(/^(-|\d+\.)\s+(.*)$/);
        if (m && (m[1] === '-') !== ordered) {
          items.push(m[2]);
          i++;
        } else if (!isBlank(lines[i]) && /^\s{2,}\S/.test(lines[i]) && items.length > 0) {
          items[items.length - 1] += ' ' + lines[i].trim();
          i++;
        } else break;
      }

      tokens.push({ type: 'list', ordered, items });
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      const quote = [];
      while (i < lines.length && lines[i].startsWith('>')) quote.push(lines[i++].replace(/^>\s?/, ''));
      tokens.push({ type: 'quote', text: quote.join(' ') });
      continue;
    }

    // Paragraph
    const para = [];
    while (
      i < lines.length &&
      !isBlank(lines[i]) &&
      !/^(#{2,4}\s|```|:::|\||>|-\s|\d+\.\s)/.test(lines[i])
    )
      para.push(lines[i++].trim());
    if (para.length === 0) {
      // Unknown construct: treat the line as text so the loop always advances.
      para.push(lines[i++].trim());
    }

    tokens.push({ type: 'para', text: para.join(' ') });
  }

  return tokens;
}

// Small build-time syntax highlighter (replaces the old client-side Shiki).
function highlight(code, lang) {
  const rules = {
    js: /(\/\/[^\n]*)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|\b(const|let|await|async|function|return|new|for|of|if|else|true|false)\b/g,
    sh: /(#[^\n]*)|('[^'\n]*'|"(?:\\.|[^"\\\n])*")|\b(curl)\b/g,
    json: /()("(?:\\.|[^"\\\n])*")|\b(true|false|null)\b/g
  };
  const alias = { javascript: 'js', bash: 'sh', shell: 'sh' };
  const re = rules[alias[lang] || lang];
  if (!re) return escapeHtml(code);
  let out = '';
  let last = 0;
  for (const m of code.matchAll(re)) {
    out += escapeHtml(code.slice(last, m.index));
    const cls = m[1] ? 'c' : m[2] ? 's' : 'k';
    out += `<span class="${cls}">${escapeHtml(m[0])}</span>`;
    last = m.index + m[0].length;
  }

  return out + escapeHtml(code.slice(last));
}

// Split tokens into groups that start at each h3 (used by card/step/faq containers).
function groupByH3(tokens) {
  const groups = [];
  for (const t of tokens) {
    if (t.type === 'heading' && t.level === 3) groups.push({ heading: t, body: [] });
    else if (groups.length > 0) groups.at(-1).body.push(t);
  }

  return groups;
}

function renderTokens(tokens, ctx) {
  return tokens.map((t) => renderToken(t, ctx)).join('\n');
}

function renderToken(t, ctx) {
  switch (t.type) {
    case 'heading': {
      return `<h${t.level} id="${t.id}">${inline(t.text)}</h${t.level}>`;
    }

    case 'para': {
      return `<p>${inline(t.text)}</p>`;
    }

    case 'list': {
      const tag = t.ordered ? 'ol' : 'ul';
      return `<${tag}>${t.items.map((item) => `<li>${inline(item)}</li>`).join('')}</${tag}>`;
    }

    case 'table': {
      const head = t.head.map((c) => `<th scope="col">${inline(c)}</th>`).join('');
      const rows = t.rows
        .map(
          (r) =>
            `<tr>${r
              .map((c, idx) => (idx === 0 ? `<th scope="row">${inline(c)}</th>` : `<td>${inline(c)}</td>`))
              .join('')}</tr>`
        )
        .join('\n');
      const caption = t.caption ? `<caption>${inline(t.caption)}</caption>` : '';
      return `<div class="table-wrap"><table>${caption}<thead><tr>${head}</tr></thead><tbody>\n${rows}\n</tbody></table></div>`;
    }

    case 'code': {
      const label = t.lang ? ` data-lang="${escapeHtml(t.lang)}"` : '';
      return `<pre${label}><code>${highlight(t.code, t.lang)}</code></pre>`;
    }

    case 'quote': {
      return `<blockquote><p>${inline(t.text)}</p></blockquote>`;
    }

    case 'html': {
      return t.html;
    }

    case 'container': {
      return renderContainer(t, ctx);
    }

    default: {
      throw new Error(`unknown token ${t.type}`);
    }
  }
}

function renderContainer(t, ctx) {
  switch (t.name) {
    case 'cards': {
      const cards = groupByH3(t.children)
        .map((g) => `<article class="card${g.heading.icon ? ' card-icon' : ''}">\n${g.heading.icon ? `<div class="icon"><img src="${g.heading.icon}" alt="" width="40" height="40"></div>\n` : ''}${renderToken(g.heading, ctx)}\n${renderTokens(g.body, ctx)}\n</article>`)
        .join('\n');
      return `<div class="card-grid">\n${cards}\n</div>`;
    }

    case 'steps': {
      const groups = groupByH3(t.children);
      ctx.steps.push(
        ...groups.map((g) => ({ name: stripInline(g.heading.text), text: tokensToText(g.body) }))
      );
      const steps = groups
        .map((g) => `<li class="step">\n${renderToken(g.heading, ctx)}\n${renderTokens(g.body, ctx)}\n</li>`)
        .join('\n');
      return `<ol class="steps">\n${steps}\n</ol>`;
    }

    case 'faq': {
      const groups = groupByH3(t.children);
      ctx.faq.push(
        ...groups.map((g) => ({ question: stripInline(g.heading.text), answer: tokensToText(g.body) }))
      );
      return groups
        .map((g) => `<div class="faq-item">\n${renderToken(g.heading, ctx)}\n${renderTokens(g.body, ctx)}\n</div>`)
        .join('\n');
    }

    case 'note': {
      return `<aside class="note">\n${renderTokens(t.children, ctx)}\n</aside>`;
    }

    case 'buttons': {
      // Each paragraph is one link: [Label](href); the first is the primary button.
      const links = t.children
        .filter((c) => c.type === 'para')
        .map((c, idx) => {
          const m = c.text.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
          if (!m) throw new Error(`buttons container expects one link per paragraph: ${c.text}`);
          return `<a class="${idx === 0 ? 'btn-primary' : 'btn-secondary'}" href="${m[2]}">${escapeHtml(m[1])}</a>`;
        })
        .join('\n');
      return `<div class="cta-buttons">\n${links}\n</div>`;
    }

    default: {
      throw new Error(`unknown container :::${t.name}`);
    }
  }
}

function tokensToText(tokens) {
  return tokens
    .map((t) => {
      if (t.type === 'para' || t.type === 'quote') return stripInline(t.text);
      if (t.type === 'list') return t.items.map((x) => stripInline(x)).join('; ');
      if (t.type === 'table') return t.rows.map((r) => r.map((c) => stripInline(c)).join(', ')).join('; ');
      if (t.type === 'code') return t.code;
      if (t.type === 'container') return tokensToText(t.children);
      return '';
    })
    .filter(Boolean)
    .join(' ');
}

// Wrap top-level tokens into <section class="band"> blocks, one per h2.
function renderBands(tokens, ctx, wide) {
  const bands = [];
  for (const t of tokens) {
    if ((t.type === 'heading' && t.level === 2) || bands.length === 0) bands.push([]);
    bands.at(-1).push(t);
  }

  return bands
    .map((band) => {
      const h2 = band[0].type === 'heading' && band[0].level === 2 ? band[0] : null;
      const labelled = h2 ? ` aria-labelledby="${h2.id}"` : '';
      const inner = renderTokens(band, ctx);
      const body = wide ? inner : `<div class="prose">\n${inner}\n</div>`;
      return `<section class="band"${labelled}>\n<div class="container">\n${body}\n</div>\n</section>`;
    })
    .join('\n');
}

// ---------------------------------------------------------------------------
// Markdown copy (for /<slug>/index.md and llms-full.txt)

function toMarkdown(page) {
  const out = [];
  const lines = page.body.split('\n');
  let inCode = false;
  let skippingHtml = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line)) inCode = !inCode;
    if (inCode || /^```/.test(line)) {
      out.push(line);
      continue;
    }

    if (skippingHtml) {
      if (line.trim() === '') skippingHtml = false;
      continue;
    }

    const prevBlank = i === 0 || lines[i - 1].trim() === '';
    if (prevBlank && line.startsWith('<')) {
      skippingHtml = true;
      continue;
    }

    if (/^:::/.test(line)) continue;
    out.push(line.replace(/\s*\{icon=[^}]+\}$/, '').replace(/\]\((\/[^)]*)\)/g, (_, href) => `](${SITE.url}${href})`));
  }

  const body = out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return `# ${page.meta.h1}\n\n${page.meta.lead}\n\nSource: ${page.url}\n\n${body}\n`;
}

// ---------------------------------------------------------------------------
// Page assembly

function loadPages() {
  return fs
    .readdirSync(CONTENT)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const { meta, body } = parseFrontMatter(fs.readFileSync(path.join(CONTENT, file), 'utf8'));
      const name = file.replace(/\.md$/, '');
      const slug = name === 'index' ? '' : name;
      const is404 = name === '404';
      return {
        file,
        name,
        slug,
        is404,
        meta,
        body,
        path: is404 ? '/404.html' : slug ? `/${slug}/` : '/',
        url: is404 ? `${SITE.url}/404.html` : `${SITE.url}${slug ? `/${slug}/` : '/'}`,
        mdPath: is404 ? null : slug ? `/${slug}/index.md` : '/index.md'
      };
    })
    .sort((a, b) => (a.meta.order ?? 99) - (b.meta.order ?? 99));
}

function renderNav(pages, current) {
  const items = pages
    .filter((p) => p.meta.nav)
    .map((p) => {
      const cur = p === current ? ' aria-current="page"' : '';
      return `<li><a href="${p.path}"${cur}>${escapeHtml(p.meta.nav)}</a></li>`;
    });
  items.push(
    '<li><a class="nav-cta" href="https://forwardemail.net/en/private-business-email">Forward Email pricing</a></li>'
  );
  return `<nav aria-label="Main"><ul class="nav-links">\n${items.join('\n')}\n</ul></nav>`;
}

function renderFooter(pages, page) {
  const guides = pages
    .filter((p) => p.meta.nav)
    .map((p) => `<li><a href="${p.path}">${escapeHtml(p.meta.footer || p.meta.nav)}</a></li>`)
    .join('\n');
  const edit = `${SITE.repo}/blob/main/content/${page.file}`;
  return `<footer class="site-footer">
<div class="container">
<div class="footer-content">
<div class="footer-brand">
<a class="logo" href="/">AlumniEmail</a>
<p>Guides on lifetime alumni email forwarding for universities, written by the Forward Email team.</p>
<p>Forward Email is an open-source email service. Its <a href="https://github.com/forwardemail/forwardemail.net">source code is on GitHub</a>.</p>
</div>
<div class="footer-links">
<div>
<h2>Alumni email guides</h2>
<ul>
${guides}
</ul>
</div>
<div>
<h2>Forward Email</h2>
<ul>
<li><a href="https://forwardemail.net/en/private-business-email">Plans and pricing</a></li>
<li><a href="https://forwardemail.net/en/blog/docs/alumni-email-forwarding-university-case-study">University case study</a></li>
<li><a href="https://forwardemail.net/en/email-api">Email API reference</a></li>
<li><a href="https://forwardemail.net/en/faq">Forward Email FAQ</a></li>
<li><a href="https://forwardemail.net/en/privacy">Privacy policy</a></li>
<li><a href="https://forwardemail.net/en/terms">Terms of use</a></li>
<li><a href="https://github.com/forwardemail">Forward Email on GitHub</a></li>
<li><a href="https://x.com/fwdemail">Forward Email on X</a></li>
<li><a href="https://www.youtube.com/forwardemail">Forward Email on YouTube</a></li>
</ul>
</div>
<div>
<h2>About this site</h2>
<ul>
<li><a href="${SITE.repo}">Source on GitHub</a></li>
<li><a href="${SITE.repo}/issues">Report a problem</a></li>
<li><a href="/about/#privacy-on-this-site">Privacy on this site</a></li>
</ul>
</div>
</div>
</div>
<div class="footer-bottom">
<p>Run by the Forward Email team. Not affiliated with the universities named on this site.</p>
<p><a href="${edit}">Edit this page on GitHub</a></p>
</div>
</div>
</footer>`;
}

function breadcrumbs(page, home) {
  if (page.slug === '' || page.is404) return null;
  return [
    { name: 'Home', url: home.url },
    { name: page.meta.crumb || page.meta.nav || page.meta.h1, url: page.url }
  ];
}

function jsonLd(page, home, ctx) {
  const crumbs = breadcrumbs(page, home);
  const website = {
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    url: `${SITE.url}/`,
    name: SITE.name,
    description: SITE.summary,
    inLanguage: 'en',
    publisher: { '@id': ORG['@id'] }
  };
  const webpage = {
    '@type': page.meta.schema || 'WebPage',
    '@id': `${page.url}#webpage`,
    url: page.url,
    name: page.meta.title,
    description: page.meta.description,
    inLanguage: 'en',
    isPartOf: { '@id': website['@id'] },
    publisher: { '@id': ORG['@id'] },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: SITE.url + SITE.ogImage,
      width: 1200,
      height: 630
    }
  };
  const graph = [ORG, website, webpage];

  if (crumbs) {
    const list = {
      '@type': 'BreadcrumbList',
      '@id': `${page.url}#breadcrumb`,
      itemListElement: crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: c.url
      }))
    };
    webpage.breadcrumb = { '@id': list['@id'] };
    graph.push(list);
  }

  if (ctx.faq.length > 0 && page.meta.schema === 'FAQPage') {
    webpage.mainEntity = ctx.faq.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer }
    }));
  }

  if (ctx.steps.length > 0 && page.meta.howto) {
    graph.push({
      '@type': 'HowTo',
      '@id': `${page.url}#howto`,
      name: page.meta.howto,
      step: ctx.steps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.name,
        text: s.text
      }))
    });
  }

  if (page.meta.service) {
    graph.push({
      '@type': 'Service',
      '@id': `${SITE.url}/#service`,
      name: 'Alumni email forwarding for universities',
      serviceType: 'Email forwarding',
      description: stripInline(page.meta.lead),
      provider: { '@id': ORG['@id'] },
      audience: { '@type': 'Audience', audienceType: 'Universities and colleges' },
      url: 'https://forwardemail.net/en/alumni-email-forwarding',
      offers: {
        '@type': 'Offer',
        name: 'Forward Email Enterprise',
        url: 'https://forwardemail.net/en/private-business-email',
        price: '250',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '250',
          priceCurrency: 'USD',
          unitText: 'MONTH'
        }
      }
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

function renderPage(page, pages, home) {
  const ctx = { faq: [], steps: [] };
  const tokens = parseBlocks(page.body.split('\n'));
  const content = renderBands(tokens, ctx, page.meta.layout === 'wide');
  const { meta } = page;
  const crumbs = breadcrumbs(page, home);

  const crumbHtml = crumbs
    ? `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${crumbs
        .map((c, i) =>
          i === crumbs.length - 1
            ? `<li><span aria-current="page">${escapeHtml(c.name)}</span></li>`
            : `<li><a href="${c.url.replace(SITE.url, '')}">${escapeHtml(c.name)}</a></li>`
        )
        .join('')}</ol></nav>`
    : '';

  const isHome = page.slug === '';
  const heroButtons = meta.cta
    ? `<div class="cta-buttons">${meta.cta
        .split(';')
        .map((pair, idx) => {
          const [label, href] = pair.split('=>').map((s) => s.trim());
          return `<a class="${idx === 0 ? 'btn-primary' : 'btn-secondary'}" href="${href}">${escapeHtml(label)}</a>`;
        })
        .join('')}</div>`
    : '';

  const hero = `<div class="hero${isHome ? '' : ' page-hero'}">
<div class="container">
<div class="${isHome ? 'hero-content' : ''}">
${crumbHtml}
<h1>${escapeHtml(meta.h1)}</h1>
<p class="lead">${inline(meta.lead)}</p>
${heroButtons}
</div>
</div>
</div>`;

  const ogType = isHome ? 'website' : 'article';
  const robots = page.is404 ? 'noindex, follow' : 'index, follow, max-image-preview:large';
  const canonical = page.is404 ? '' : `<link rel="canonical" href="${page.url}">\n`;
  const alternate = page.mdPath
    ? `<link rel="alternate" type="text/markdown" href="${page.mdPath}" title="Markdown version">\n`
    : '';
  const scripts = (meta.scripts || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => `<script src="${s}" defer></script>\n`)
    .join('');
  const ogUrl = page.is404 ? `${SITE.url}/` : page.url;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(meta.title)}</title>
<meta name="description" content="${escapeHtml(meta.description)}">
<meta name="robots" content="${robots}">
${canonical}<meta name="referrer" content="strict-origin-when-cross-origin">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests">
<meta name="theme-color" content="${SITE.themeColor}">
<meta name="author" content="Forward Email">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/images/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/images/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/graduate-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/montserrat-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/style.min.css">
${alternate}<link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="${escapeHtml(meta.title)}">
<meta property="og:description" content="${escapeHtml(meta.description)}">
<meta property="og:url" content="${ogUrl}">
<meta property="og:image" content="${SITE.url}${SITE.ogImage}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${escapeHtml(SITE.ogImageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(meta.title)}">
<meta name="twitter:description" content="${escapeHtml(meta.description)}">
<meta name="twitter:image" content="${SITE.url}${SITE.ogImage}">
<meta name="twitter:image:alt" content="${escapeHtml(SITE.ogImageAlt)}">
${page.is404 ? '' : `<script type="application/ld+json">${jsonLd(page, home, ctx)}</script>\n`}${scripts}</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
<div class="container header-content">
<a class="logo" href="/">AlumniEmail</a>
${renderNav(pages, page)}
</div>
</header>
<main id="main">
${hero}
${content}
</main>
${renderFooter(pages, page)}
</body>
</html>
`;
  return { html, ctx };
}

// ---------------------------------------------------------------------------
// Other outputs

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,])\s*/g, '$1')
    .replace(/:\s+/g, ':')
    .replace(/;}/g, '}')
    .trim();
}

function sitemap(pages) {
  const urls = pages
    .filter((p) => !p.is404)
    .map((p) => `  <url>\n    <loc>${p.url}</loc>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function robots() {
  const bots = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-User',
    'Claude-SearchBot',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
    'CCBot',
    'Bingbot',
    'DuckAssistBot',
    'meta-externalagent'
  ];
  return `# robots.txt for alumniemail.com
# All crawlers, including AI and answer-engine crawlers, may index this site.

User-agent: *
Allow: /

${bots.map((b) => `User-agent: ${b}`).join('\n')}
Allow: /

Sitemap: ${SITE.url}/sitemap.xml
`;
}

function llmsTxt(pages) {
  const list = pages
    .filter((p) => !p.is404)
    .map((p) => `- [${p.meta.h1}](${SITE.url}${p.mdPath}): ${p.meta.description}`)
    .join('\n');
  return `# ${SITE.name}

> ${SITE.summary} The site is run by the Forward Email team and is not affiliated with the universities it names.

Each page below links to its Markdown copy. HTML versions live at the same path without \`index.md\`. The full text of every page is in [llms-full.txt](${SITE.url}/llms-full.txt).

## Guides

${list}

## Forward Email sources

- [University alumni email case study](https://forwardemail.net/en/blog/docs/alumni-email-forwarding-university-case-study): Forward Email's published case study with university names, alumni counts and cost figures.
- [Plans and pricing](https://forwardemail.net/en/private-business-email): Current Forward Email plans, including the Enterprise plan for universities.
- [Forward Email FAQ](https://forwardemail.net/en/faq): DNS setup, privacy, logging, SRS, ARC and other technical details.
- [Email API reference](https://forwardemail.net/en/email-api): REST API for creating and updating domain aliases.

## Optional

- [Source code for this site](${SITE.repo}): Static HTML generated by scripts/build.js from content/*.md.
`;
}

function llmsFull(pages) {
  const parts = pages.filter((p) => !p.is404).map((p) => toMarkdown(p).trim());
  return `# ${SITE.name}: full text\n\n> ${SITE.summary}\n\n${parts.join('\n\n---\n\n')}\n`;
}

function manifest() {
  return (
    JSON.stringify(
      {
        name: 'AlumniEmail',
        short_name: 'AlumniEmail',
        description: 'Lifetime alumni email forwarding for universities, from the Forward Email team.',
        start_url: '/',
        scope: '/',
        display: 'browser',
        background_color: '#ffffff',
        theme_color: SITE.themeColor,
        icons: [
          { src: '/images/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/images/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/images/icon.svg', sizes: 'any', type: 'image/svg+xml' }
        ]
      },
      null,
      2
    ) + '\n'
  );
}

// ---------------------------------------------------------------------------

// Cloudflare sits in front of GitHub Pages, and its Email Address Obfuscation
// rewrites addresses in served HTML into links that need a decoder script,
// which the CSP blocks. Wrap every address and mailto: link in the page body
// in the <!--email_off--> markers Cloudflare documents, so readers and
// crawlers see the real address. Cloudflare does not rewrite the <head>.
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;

function protectEmails(html) {
  const end = html.indexOf('</head>');
  const head = end === -1 ? '' : html.slice(0, end + 7);
  const body = end === -1 ? html : html.slice(end + 7);
  const token =
    /<!--email_off-->[\s\S]*?<!--\/email_off-->|<!--[\s\S]*?-->|<(script|style|textarea)\b[\s\S]*?<\/\1>|<a\b[^>]*href="mailto:[^"]*"[^>]*>[\s\S]*?<\/a>|<[^>]+>|[^<]+/gi;
  return (
    head +
    body.replace(token, (t) => {
      if (t.startsWith('<!--') || /^<(script|style|textarea)\b/i.test(t)) return t;
      if (/^<a\b/i.test(t)) return `<!--email_off-->${t}<!--/email_off-->`;
      if (t.startsWith('<')) return t;
      return t.replace(EMAIL_RE, (e) => `<!--email_off-->${e}<!--/email_off-->`);
    })
  );
}

function write(rel, data) {
  if (rel.endsWith('.html')) data = protectEmails(data);
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
}

function build() {
  const pages = loadPages();
  const home = pages.find((p) => p.slug === '');
  const navPages = pages.filter((p) => !p.is404);

  for (const page of pages) {
    for (const key of ['title', 'description', 'h1', 'lead']) {
      if (!page.meta[key]) throw new Error(`${page.file}: missing front matter "${key}"`);
    }

    const { html } = renderPage(page, navPages, home);
    if (page.is404) write('404.html', html);
    else {
      write(page.slug ? `${page.slug}/index.html` : 'index.html', html);
      write(page.mdPath.slice(1), toMarkdown(page));
      // Same content at /<slug>.md for tools that request the path with a .md suffix
      if (page.slug) write(`${page.slug}.md`, toMarkdown(page));
    }
  }

  write('css/style.min.css', minifyCss(fs.readFileSync(path.join(ROOT, 'css/style.css'), 'utf8')) + '\n');
  write('sitemap.xml', sitemap(pages));
  write('robots.txt', robots());
  write('llms.txt', llmsTxt(pages));
  write('llms-full.txt', llmsFull(pages));
  write('site.webmanifest', manifest());

  console.log(`Built ${pages.length} pages.`);
}

build();
