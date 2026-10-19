---
title: Migrate Alumni Email from Google Workspace or Microsoft 365
description: Move alumni accounts off Google Workspace or Microsoft 365: collect destinations, create aliases, switch MX records, export mail.
h1: How to move alumni email off Google Workspace or Microsoft 365
lead: Moving alumni accounts to forwarding has three parts. Collect each graduate's personal address, create a forwarding alias with the same user name, then switch mail delivery for the alumni domain. Mail stored in the old accounts does not move by itself, so graduates who want it export it first.
nav: Migration
crumb: Migration guide
order: 3
---

## Before you start

Make a short inventory so the cutover has no surprises:

- **Accounts.** Export the list of alumni accounts from the Google Admin console or the Microsoft 365 admin center, with each user name.
- **Destinations.** Collect a personal address for every graduate, for example from your alumni database or an opt-in form. Accounts without a destination can stay disabled until the graduate asks.
- **Domain layout.** Check whether alumni share a domain with staff and current students, or already have their own domain or subdomain.
- **Sending needs.** Decide whether alumni only receive mail through the forward, or also send from the address. Sending needs SMTP on a paid plan and SPF, DKIM and DMARC records.
- **Communication.** Plan the notices to alumni: what changes, when, and how to export old mail.

## Option 1: alumni have their own domain or subdomain

This is the simplest case. If alumni addresses already live on a separate host name such as `alumni.example.edu`, you can move that host name to Forward Email in one step:

:::steps
### Create the aliases
Create one alias per account in Forward Email with the same user name, using the API or the dashboard. Turn on recipient verification if destinations come from an old or unconfirmed list.

### Lower the TTL
A day before cutover, lower the TTL on the alumni domain's MX records so the change spreads faster.

### Switch the MX records
Replace the Google or Microsoft MX records for the alumni domain with `mx1.forwardemail.net` and `mx2.forwardemail.net`, and add the verification TXT record.

### Watch delivery
Send test messages from outside providers. Check the Forward Email error logs, which keep 4xx and 5xx SMTP errors for 7 days.

### Retire the old accounts
After graduates have had time to export their mail, suspend and then delete the old Google Workspace or Microsoft 365 accounts.
:::

## Option 2: alumni share the main domain with staff

Forward Email advises listing only one mail exchange in DNS and not using MX priority to split mail between two providers. Instead, keep the MX records pointing at your current provider and have it route addresses it does not host to Forward Email. Forward Email documents this setup under [multiple MX exchanges](https://forwardemail.net/en/faq#can-i-use-multiple-mx-exchanges-and-servers-for-advanced-forwarding):

- **Google Workspace:** set up a Gmail routing rule that sends mail for unrecognized addresses to `mx1.forwardemail.net` or `mx2.forwardemail.net`. See Google's help on [Gmail routing settings](https://support.google.com/a/answer/6297084).
- **Microsoft 365:** set up a connector that routes mail for addresses Microsoft 365 does not host to Forward Email. See Microsoft's guides on [setting up connectors](https://learn.microsoft.com/en-us/exchange/mail-flow-best-practices/use-connectors-to-configure-mail-flow/set-up-connectors-to-route-mail) and [mail flow with mailboxes in multiple locations](https://learn.microsoft.com/en-us/exchange/mail-flow-best-practices/manage-mail-flow-for-multiple-locations).

Once routing works, remove each alumni account from Google or Microsoft. Mail for that address then counts as unrecognized and goes to Forward Email, where the alias forwards it on. Many universities later move alumni to their own subdomain to remove this dependency.

## What happens to mail already in the old accounts?

Forwarding only handles new mail, so graduates who want their history should export it before the old account is deleted:

Table: How graduates export mail from the old account
| Provider | Export format | How |
|---|---|---|
| Google Workspace (Gmail) | MBOX | [Google Takeout](https://takeout.google.com/settings/takeout/custom/gmail) |
| Microsoft 365 (Outlook) | PST | [Outlook export and backup](https://support.microsoft.com/en-us/office/back-up-your-email-e5845b0b-1aeb-424f-924c-aa1c33b18833) |

Graduates can import the export into their personal mail account. If your university offers Forward Email mailboxes as well as forwarding, the [Forward Email FAQ](https://forwardemail.net/en/faq#how-do-i-import-and-migrate-my-existing-mailbox) shows how to upload MBOX or EML files over IMAP with Thunderbird and the ImportExportTools NG add-on. Paid plans include 10 GB of pooled storage, and extra storage costs $3 per month for each additional 10 GB.

## Cutover checklist

- Every account on the inventory has an alias or a documented reason it does not.
- Test messages from Gmail, Outlook.com and a university staff account all arrive at the destination.
- SPF, DKIM and DMARC records are in place if alumni will send mail.
- Alumni received notice, export instructions and a date for the old account's removal.
- Your provisioning job creates new aliases for each graduating class through the [API](/how-it-works/#how-do-you-create-aliases-from-your-alumni-database).

Costs before and after a move are on the [cost comparison](/cost-comparison/) page.
