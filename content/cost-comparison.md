---
title: Alumni Email Costs: Forward Email vs Google and Microsoft
description: Sourced alumni email costs: Forward Email Enterprise at a flat $250/month versus per-user Google Workspace and Microsoft 365.
h1: Alumni email cost comparison
lead: Forward Email's Enterprise plan costs a flat $250 per month, or $3,000 per year, for unlimited domains and aliases. Per-user suites charge for every account, so their cost grows with each graduating class.
nav: Costs
crumb: Cost comparison
order: 4
scripts: /js/calculator.js
service: true
---

## What does Forward Email cost a university?

The Enterprise plan is $250 per month for unlimited domains, quoted and invoiced directly. It includes everything in the Team plan plus unlimited API requests, a terms exception for third-party use such as alumni, a countersigned agreement and DPA, a dedicated support chatroom and onboarding help. Aliases have no per-user fee. Source: [Forward Email pricing](https://forwardemail.net/en/private-business-email) and [Enterprise license details](https://forwardemail.net/en/faq#what-is-included-in-the-enterprise-license).

Forwarding needs no mailbox storage. If you also give alumni IMAP mailboxes, paid plans include 10 GB of pooled storage, and each additional 10 GB costs $3 per month.

## How does that compare with per-user providers?

Forward Email's [university case study](https://forwardemail.net/en/blog/docs/alumni-email-forwarding-university-case-study) lists these figures for 100,000 alumni:

Table: Cost for 100,000 alumni by solution, from the Forward Email case study
| Solution | Cost per alumnus (annual) | Cost for 100,000 alumni |
|---|---|---|
| Google Workspace for Business | $72 | $7,200,000 |
| Google Workspace for Education | Free (Education Fundamentals), $3/student/year (Education Standard), $5/student/year (Education Plus) | Free to $500,000 |
| Microsoft 365 Business | $60 | $6,000,000 |
| Microsoft 365 Education | Free (A1), $38-55/faculty/year (A3), $65-96/faculty/year (A5) | Free to $96,000 |
| Self-hosted Exchange | $45 | $4,500,000 |
| Forward Email Enterprise | Fixed $250/month | $3,000/year |

Figures as published in the Forward Email case study. Vendor prices change, so confirm current list prices with Google and Microsoft before you budget. The case study notes that the free education tiers are limited: Google's free tier to core services and Microsoft's A1 tier to web versions.

## What did the case study universities save?

The case study reports these annual figures for its four named universities. The Google column works out to $3 per alumnus per year, the Education Standard rate.

Table: Annual alumni email costs reported in the Forward Email case study
| University | Alumni count | Annual cost with Google | Annual cost with Forward Email | Annual savings |
|---|---|---|---|---|
| University of Cambridge | 30,000 | $90,000 | $3,000 | $87,000 |
| Swarthmore College | 5,000 | $15,000 | $3,000 | $12,000 |
| Tufts University | 12,000 | $36,000 | $3,000 | $33,000 |
| University of Maryland | 25,000 | $75,000 | $3,000 | $72,000 |

## Estimate your own cost

Enter your alumni count and pick a per-alumnus rate from the case study table. The estimate multiplies the two and compares the result with Forward Email Enterprise at $3,000 per year. It leaves out storage, staff time and any discounts you may have.

<div class="calculator">
<div id="calc-form" class="calc-form" role="group" aria-label="Cost estimate inputs" aria-describedby="calc-help">
<div class="form-group">
<label for="alumni-count">Number of alumni</label>
<input type="number" id="alumni-count" name="alumni" value="10000" min="1" max="10000000" step="1" inputmode="numeric">
</div>
<div class="form-group">
<label for="current-solution">Current or planned solution</label>
<select id="current-solution" name="rate">
<option value="3">Google Workspace for Education Standard ($3 per year)</option>
<option value="5">Google Workspace for Education Plus ($5 per year)</option>
<option value="45">Self-hosted Exchange ($45 per year)</option>
<option value="60">Microsoft 365 Business ($60 per year)</option>
<option value="72">Google Workspace for Business ($72 per year)</option>
</select>
</div>
<p id="calc-help" class="fine">Rates come from the Forward Email case study table above. The estimate updates as you type when JavaScript is on.</p>
</div>
<div class="calc-results" aria-live="polite">
<dl>
<dt>Estimated annual cost now</dt>
<dd id="current-cost">$30,000</dd>
<dt>Forward Email Enterprise per year</dt>
<dd id="new-cost">$3,000</dd>
<dt>Estimated annual difference</dt>
<dd id="savings">$27,000</dd>
</dl>
<p class="fine">Default shown: 10,000 alumni at $3 per year.</p>
</div>
</div>

## Costs that are not on the invoice

Per-user mailboxes also carry work that forwarding removes. The case study lists the problems universities face with full alumni mailboxes: per-user licenses that grow with every class, administration of thousands of accounts, security exposure from dormant accounts and growing storage needs. With forwarding there is no alumni mailbox to secure or store, and new aliases can be created by the [API](/how-it-works/#how-do-you-create-aliases-from-your-alumni-database) as part of graduation.

See the [migration guide](/migrate-from-google-workspace-microsoft-365/) for the steps to move existing accounts.
