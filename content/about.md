---
title: About AlumniEmail: Run by the Forward Email Team
description: Who runs AlumniEmail, how to reach the Forward Email team, where the source lives, and why the site uses no cookies or trackers.
h1: About AlumniEmail
lead: AlumniEmail is a guide to lifetime alumni email forwarding for universities. The Forward Email team writes and maintains it, and every claim about Forward Email links to a page on forwardemail.net.
nav: About
crumb: About
order: 7
schema: AboutPage
---

## Who runs this site?

The Forward Email team runs AlumniEmail. [Forward Email](https://forwardemail.net) is an open-source email service for custom domains. It supports IMAP, POP3, SMTP, CalDAV and CardDAV, and it can be self-hosted with Docker. Its founder was one of the first employees at DuckDuckGo.

This site explains one use of Forward Email: [lifetime alumni addresses on a university domain](/). It is not affiliated with any university. University names appear only where Forward Email's [published case study](https://forwardemail.net/en/blog/docs/alumni-email-forwarding-university-case-study) names them, and no university has reviewed or endorsed this site.

## Where do the numbers come from?

Prices for Forward Email come from the [pricing page](https://forwardemail.net/en/private-business-email) and the [Forward Email FAQ](https://forwardemail.net/en/faq). University names, alumni counts and the Google, Microsoft and Exchange cost figures come from the case study. Each page links to its source next to the claim. Vendor prices change, so confirm current figures before you budget.

## How do I contact the team?

- **About Forward Email for your university:** email [support@forwardemail.net](mailto:support@forwardemail.net).
- **About this site:** open an issue on [GitHub](https://github.com/forwardemail/alumniemail.com/issues).
- **Security reports:** email [security@forwardemail.net](mailto:security@forwardemail.net), as the Forward Email [security policy](https://forwardemail.net/en/security) describes. This site also publishes a `security.txt` file at `/.well-known/security.txt`.

## Source code

The site's source is public at [github.com/forwardemail/alumniemail.com](https://github.com/forwardemail/alumniemail.com). Pages are written in Markdown under `content/` and turned into static HTML by a small Node.js script with no dependencies. Every page also has a Markdown copy at `index.md` in the same folder, and `/llms.txt` lists them for AI tools.

## Privacy on this site

This site sets no cookies and runs no analytics, trackers or third-party scripts. Fonts, styles and images load from this domain only. The one script on the site runs the cost calculator in your browser and sends nothing anywhere.

Requests to alumniemail.com pass through Cloudflare, which runs as a CDN and proxy in front of GitHub Pages and processes the IP address of each visitor ([Cloudflare privacy policy](https://www.cloudflare.com/privacypolicy/)). GitHub Pages hosts the files and logs the IP address of each visitor for security purposes ([GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)); the [GitHub Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement) covers that data. For Forward Email's own service, see the [Forward Email privacy policy](https://forwardemail.net/en/privacy).
