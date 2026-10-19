---
title: Alumni Email Forwarding FAQ for University IT Staff
description: Answers for university IT staff on alumni email forwarding: storage, logs, DNS, Google and Microsoft coexistence, API and price.
h1: Alumni email forwarding FAQ for IT staff
lead: Short answers to the questions university IT, security and alumni relations teams ask about running lifetime alumni addresses on Forward Email. Each answer links to the Forward Email source.
nav: FAQ
crumb: FAQ
order: 6
schema: FAQPage
---

## Service and setup

:::faq
### What is alumni email forwarding?
It is a lifetime address on the university's domain that delivers each message to a personal inbox the graduate chooses. The university keeps the address and the graduate keeps receiving mail when they change jobs or providers. There is no alumni mailbox to license or store.

### Which DNS records does Forward Email need?
Two MX records, `mx1.forwardemail.net` and `mx2.forwardemail.net`, both with priority 0, on the domain or subdomain that holds the alumni addresses. Paid plans add one TXT record, `forward-email-site-verification=` with the value from your dashboard. See [how it works](/how-it-works/#which-dns-records-do-you-need).

### Can staff mail stay on Google Workspace or Microsoft 365?
Yes. Put alumni on a subdomain such as `alumni.example.edu` and point only that subdomain's MX records at Forward Email. If alumni must share the main domain, keep your current MX records and have Google or Microsoft route addresses they do not host to Forward Email. The [migration guide](/migrate-from-google-workspace-microsoft-365/) explains both options.

### How long does setup take?
Forward Email estimates under 10 minutes for the DNS setup itself. DNS changes can take up to 24 to 48 hours to reach every resolver. Planning, alias import and alumni notices take longer and depend on your institution.

### Can we create alumni addresses automatically?
Yes. The [REST API](https://forwardemail.net/en/email-api) creates, lists, updates and deletes aliases, so a nightly job can add each graduating class from your alumni database. The Enterprise plan has no API rate limit. See the [API example](/how-it-works/#how-do-you-create-aliases-from-your-alumni-database).

### How do alumni change their forwarding address?
Your team or your own alumni portal updates the alias recipients through the dashboard or the API. The case study describes a custom-branded self-service portal for Cambridge alumni. Recipient verification can require each new destination to confirm by email before mail flows.
:::

## Privacy and security

:::faq
### Does Forward Email store forwarded alumni mail?
No. Forward Email processes forwarded mail in memory and does not write it to disk. It stores error logs for 4xx and 5xx SMTP responses for 7 days, with the error, envelope and headers but not the body or attachments. Source: [Do you store emails and their contents?](https://forwardemail.net/en/faq#do-you-store-emails-and-their-contents)

### Does forwarding break SPF or DMARC at the destination?
Forward Email rewrites the envelope sender with SRS, which preserves SPF validation through the forward, and supports ARC so receiving providers can see the original authentication results. SPF, DKIM, DMARC, ARC and SRS are supported on every plan.

### Is the traffic encrypted?
Yes. Forward Email enforces TLS 1.2 or newer for its connections, including SMTP, and supports MTA-STS. Source: [Do you use TLS encryption for email forwarding?](https://forwardemail.net/en/faq#do-you-use-tls-encryption-for-email-forwarding)

### Does Forward Email read or scan alumni mail for ads?
No. Forward Email does not read mail or sell data, and the case study states it never scans email content. The code is open source, so your team can check how mail is handled.

### Is there a Data Processing Agreement?
Yes. The DPA at [forwardemail.net/dpa](https://forwardemail.net/en/dpa) is accepted with the terms of service. A countersigned copy and custom DPA terms come with the Enterprise license. See [Forward Email's GDPR page](https://forwardemail.net/en/gdpr).

### Can we audit or self-host the code?
Yes. The service is open source on [GitHub](https://github.com/forwardemail/forwardemail.net) and can be self-hosted with Docker using the [self-hosted guide](https://forwardemail.net/en/self-hosted).
:::

## Plans and pricing

:::faq
### How much does alumni email forwarding cost?
The Enterprise plan is $250 per month for unlimited domains, with no fee per alias. That is $3,000 per year whether you serve 5,000 or 100,000 alumni. Mailbox storage, if you offer it, is extra at $3 per month per 10 GB. See the [cost comparison](/cost-comparison/).

### Why not use the free plan?
The free plan stores forwarding rules in public DNS TXT records, so anyone can look up where an address forwards. Forward Email's standard terms also do not cover a service used by third parties such as alumni. The Enterprise license adds that terms exception. Source: [What is included in the Enterprise License?](https://forwardemail.net/en/faq#what-is-included-in-the-enterprise-license)

### Can alumni send mail from their university address?
Yes, if you allow it. Paid plans include outbound SMTP. Each domain needs approval before it can send, and sending limits grow with sender reputation. The free plan only forwards incoming mail.

### Which universities use Forward Email for alumni?
Forward Email's [case study](/case-study/) names the University of Cambridge, the University of Maryland, Tufts University and Swarthmore College.

### How do we get started?
Email [support@forwardemail.net](mailto:support@forwardemail.net) or use the [Forward Email help form](https://forwardemail.net/en/help) (sign-in required) with your institution's legal name, registered address, registration and VAT numbers where they apply, and the name, title and email of the person who will sign. Forward Email replies with an Enterprise agreement through DocuSign.
:::
