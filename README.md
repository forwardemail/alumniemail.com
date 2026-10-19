# alumniemail.com

Source for [alumniemail.com](https://alumniemail.com), a guide for universities on lifetime alumni email forwarding with [Forward Email](https://forwardemail.net). The Forward Email team runs it. The site is not affiliated with the universities it names.

## Pages

| URL | Source | Purpose |
|---|---|---|
| `/` | `content/index.md` | Overview, benefits, case study figures, setup summary |
| `/how-it-works/` | `content/how-it-works.md` | MX and TXT records, aliases, SRS and ARC, API examples |
| `/migrate-from-google-workspace-microsoft-365/` | `content/migrate-from-google-workspace-microsoft-365.md` | Moving alumni accounts to forwarding |
| `/cost-comparison/` | `content/cost-comparison.md` | Sourced cost tables and a cost calculator |
| `/case-study/` | `content/case-study.md` | Summary of the Forward Email university case study |
| `/faq/` | `content/faq.md` | FAQ for university IT staff (with FAQPage JSON-LD) |
| `/about/` | `content/about.md` | Who runs the site, contacts, sources, privacy |
| `/404.html` | `content/404.md` | Not found page |

## How the site is built

GitHub Pages serves the committed files from the root of `main`. There is no build step in CI, so the generated HTML is committed.

`scripts/build.js` is a small Node.js script with no dependencies. It reads `content/*.md` and writes:

- `index.html` and `<slug>/index.html` for each page, plus `404.html`
- `<slug>/index.md`, a clean Markdown copy of each page
- `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt` and `site.webmanifest`
- `css/style.min.css`, minified from `css/style.css`

Each page gets the shared header, navigation and footer, canonical and Open Graph tags, and JSON-LD (Organization, WebSite, WebPage, BreadcrumbList, plus FAQPage, HowTo or Service where the page supports it).

## Editing

1. Edit a file in `content/` (or `css/style.css`).
2. Run `node scripts/build.js` (Node 18 or newer).
3. Commit the source and the generated files together.

Each content file starts with front matter:

```yaml
---
title: Page title for search results (50 to 60 characters)
description: Meta description (about 120 to 140 characters)
h1: Visible page heading
lead: Opening sentence or two under the heading
nav: Label in the navigation (omit to leave the page out of the menu)
order: Position in the navigation
schema: FAQPage or AboutPage (optional)
howto: Name for HowTo JSON-LD built from a :::steps block (optional)
service: true to add the Service and Offer JSON-LD (optional)
scripts: /js/file.js (optional, comma separated)
---
```

The body uses a small Markdown subset: `##` to `####` headings, paragraphs, lists, tables (with an optional `Table: caption` line above), fenced code, `**bold**`, `` `code` `` and links. Each `##` heading starts a new page section. These blocks are also available:

- `:::cards` with one `###` heading per card. Add `{icon=/images/svg/name.svg}` after a heading for an icon.
- `:::steps` with one `###` heading per numbered step.
- `:::faq` with one `###` question per answer. On a page with `schema: FAQPage` these become FAQPage JSON-LD.
- `:::note` for a highlighted paragraph.
- `:::buttons` with one link per paragraph.

Lines that start with `<` are passed through as raw HTML and left out of the Markdown copies.

## Facts and sources

Every claim about Forward Email must come from a page on forwardemail.net and link to it. University names and cost figures come from the [Forward Email university case study](https://forwardemail.net/en/blog/docs/alumni-email-forwarding-university-case-study). Do not add testimonials, logos or numbers that a source does not support.

## Other files

- `.well-known/security.txt`: security contact. Update the `Expires` date before it passes.
- `.nojekyll`: tells GitHub Pages to serve files as they are, including `.well-known/`.
- `fonts/`: self-hosted Graduate and Montserrat (SIL Open Font License, see the `OFL-*.txt` files).
- `images/`: icons, the Open Graph image (`og-image.jpg`, 1200x630) and card illustrations.
- `js/calculator.js`: the only script, used by the cost calculator.

## Privacy

The site sets no cookies and loads no analytics, trackers or third-party resources.
