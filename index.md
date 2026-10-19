# Lifetime alumni email forwarding for universities

Give every graduate a permanent address on your university domain. Forward Email delivers each message to the personal inbox the graduate chooses, for a flat $250 per month with no fee per alumnus.

Source: https://alumniemail.com/

## What is alumni email forwarding?

Alumni email forwarding gives each graduate an address on the university's domain, such as `jane.doe@alumni.example.edu`, and sends every message for that address on to a personal inbox. The university keeps control of the address. There is no per-person mailbox to license, back up or secure.

Universities often give students full mailboxes on Google Workspace or Microsoft 365, then face a choice at graduation: keep paying for those accounts, or shut them down and break every address graduates have printed on resumes and business cards. Forwarding keeps the address alive and drops the mailbox. See [how alumni email forwarding works](https://alumniemail.com/how-it-works/) for the DNS and alias details.

## Why universities use Forward Email for alumni addresses

### One flat price
The Enterprise plan costs $250 per month for unlimited domains, and aliases have no per-user fee. A university with 5,000 alumni and one with 100,000 pay the same. See the [cost comparison](https://alumniemail.com/cost-comparison/).

### Addresses that last
Graduates keep one university address for life. When they change jobs or personal providers, the destination changes and the address stays the same.

### No stored mail
Forward Email processes forwarded mail in memory and does not write it to disk. It keeps error logs for 4xx and 5xx SMTP responses for 7 days, with headers but without message bodies or attachments.

### Open source
The Forward Email code is public on [GitHub](https://github.com/forwardemail/forwardemail.net), so your security team can read how mail is handled. You can also self-host it with Docker.

### Email authentication built in
SPF, DKIM, DMARC, ARC and SRS are supported on every plan. SRS is set up for you, which preserves SPF validation when mail is forwarded to a graduate's personal provider.

### Automation through the API
Create, update and disable alumni aliases from your alumni database with the [REST API](https://forwardemail.net/en/email-api). The Enterprise plan includes unlimited API requests.

## Which universities use Forward Email for alumni email?

Forward Email's [published case study](https://forwardemail.net/en/blog/docs/alumni-email-forwarding-university-case-study) names four institutions whose alumni email runs on Forward Email: the University of Cambridge, the University of Maryland, Tufts University and Swarthmore College. The case study reports these annual figures:

Table: Annual alumni email costs reported in the Forward Email case study
| University | Alumni count | Annual cost with Google | Annual cost with Forward Email | Annual savings |
|---|---|---|---|---|
| University of Cambridge | 30,000 | $90,000 | $3,000 | $87,000 |
| Swarthmore College | 5,000 | $15,000 | $3,000 | $12,000 |
| Tufts University | 12,000 | $36,000 | $3,000 | $33,000 |
| University of Maryland | 25,000 | $75,000 | $3,000 | $72,000 |

Figures as published in the Forward Email case study. Read the [case study summary](https://alumniemail.com/case-study/) for the Cambridge details.

## How does setup work?

### Pick the domain
Use your main domain or a subdomain such as `alumni.example.edu`. A subdomain lets staff and student mail stay where it is.

### Point MX records
Set two MX records for that domain to `mx1.forwardemail.net` and `mx2.forwardemail.net`.

### Create aliases
Add one alias per graduate in the dashboard or through the API, each with a personal destination address.

### Test and switch
Send test messages, check SPF, DKIM and DMARC results, then announce the new addresses to alumni.

The [step-by-step guide](https://alumniemail.com/how-it-works/) covers DNS records, recipient verification and API examples. Moving existing accounts off Google Workspace or Microsoft 365 has its own [migration guide](https://alumniemail.com/migrate-from-google-workspace-microsoft-365/).

## Questions from IT teams

Common questions about storage, logging, sending mail, DPAs and pricing have short answers in the [FAQ for university IT staff](https://alumniemail.com/faq/). The Forward Email team runs this site; [about AlumniEmail](https://alumniemail.com/about/) lists its sources and contacts.

[Read the FAQ](https://alumniemail.com/faq/)

[Compare costs](https://alumniemail.com/cost-comparison/)

[Contact Forward Email](mailto:support@forwardemail.net)
