# How alumni email forwarding works

Mail for an alumni address reaches Forward Email through your domain's MX records. Forward Email looks up the alias, then sends the message on to the graduate's personal inbox without storing it.

Source: https://alumniemail.com/how-it-works/

## What happens when someone emails an alumni address?

A message to `jane.doe@alumni.example.edu` follows the same path as any other email, with one extra hop:

1. The sender's mail server looks up the MX records for `alumni.example.edu` and finds `mx1.forwardemail.net` and `mx2.forwardemail.net`.
2. Forward Email accepts the connection and checks the sender against its allowlist, denylist, greylisting and rate limits.
3. It reads the alias configuration for `jane.doe` and finds the destination, for example a Gmail or Outlook.com address.
4. It rewrites the envelope sender with the Sender Rewriting Scheme (SRS) and adds ARC headers, so authentication results survive the forward.
5. It delivers the message to the destination over TLS. The message is processed in memory and is not written to disk.

The [Forward Email FAQ](https://forwardemail.net/en/faq#how-does-your-email-forwarding-system-work) describes each SMTP step in detail.

## Which DNS records do you need?

You need two MX records on the domain that holds the alumni addresses. On a paid plan you also add one TXT record that proves you own the domain. The verification value comes from your Forward Email dashboard.

Table: DNS records for an alumni domain on Forward Email
| Name | Type | Priority | Value |
|---|---|---|---|
| `alumni` (or `@` for the root domain) | MX | 0 | `mx1.forwardemail.net` |
| `alumni` (or `@` for the root domain) | MX | 0 | `mx2.forwardemail.net` |
| `alumni` (or `@` for the root domain) | TXT | | `forward-email-site-verification=` followed by your value |

Remove any other MX records on that name. Both Forward Email records must exist. DNS changes can take up to 24 to 48 hours to reach every resolver, though they often apply sooner, so lower the TTL a day ahead if you are switching from another provider. Source: [How do I get started and set up email forwarding?](https://forwardemail.net/en/faq#how-do-i-get-started-and-set-up-email-forwarding)

If alumni will also send mail from their address, add SPF, DKIM and DMARC records as described in the [Forward Email FAQ](https://forwardemail.net/en/faq#how-do-i-set-up-spf-for-forward-email). Forward Email's SPF value is `v=spf1 a include:spf.forwardemail.net -all`.

## Should alumni use a subdomain?

A subdomain is the simplest choice when staff and current students already receive mail on the main domain through Google Workspace or Microsoft 365. MX records belong to one host name, so `alumni.example.edu` can point to Forward Email while `example.edu` keeps its current provider. Nothing changes for staff mail.

If alumni addresses must stay on the main domain, the domain can still have only one set of MX records. In that case your current provider receives all mail and routes addresses it does not recognize to Forward Email. The [migration guide](https://alumniemail.com/migrate-from-google-workspace-microsoft-365/) covers both options.

On paid plans you can also turn on **wildcard subdomain forwarding**, which lets every subdomain without its own records inherit the root domain's aliases. It is off by default and set per domain.

## How are alumni addresses set up?

Each graduate gets one **alias**. An alias has a name (the part before the `@`) and one or more recipients.

- **One alias per graduate.** `jane.doe` forwards to `jane@example.com`. Graduates can have more than one recipient.
- **Recipient verification.** With recipient verification on, a new destination receives a confirmation link, and mail flows only after the graduate clicks it. This stops typos from sending alumni mail to a stranger.
- **Catch-all and patterns.** A catch-all alias receives mail for any name that has no alias. Regular expressions can route whole patterns of names.
- **Disabling an address.** A disabled alias can accept mail quietly (code 250), ask senders to retry later (421) or reject mail permanently (550).
- **Labels.** Labels such as a class year help you find and update groups of aliases.

## Set up alumni forwarding step by step

### Get an Enterprise agreement
Contact Forward Email for the Enterprise plan. It covers use by people outside your staff, such as alumni, which the standard terms do not.

### Add the domain
Add `alumni.example.edu` in the Forward Email dashboard and copy the verification value it shows.

### Publish DNS records
Add the two MX records and the TXT verification record at your DNS provider, then run the verification check.

### Create aliases
Import aliases through the API from your alumni database, or add them in the dashboard for a pilot group.

### Test and announce
Send test messages from outside providers, confirm delivery and headers, then tell alumni about their addresses.

## How do you create aliases from your alumni database?

The [Forward Email API](https://forwardemail.net/en/email-api#create-new-domain-alias) creates an alias with one request. Authenticate with your API token as the Basic Auth user name and an empty password.

```sh
curl -X POST https://api.forwardemail.net/v1/domains/alumni.example.edu/aliases \
  -u "$API_TOKEN:" \
  -H "Content-Type: application/json" \
  -d '{"name": "jane.doe", "recipients": ["jane@example.com"], "labels": ["class-of-2025"], "has_recipient_verification": true}'
```

The same request from Node.js, for a nightly sync job:

```js
// Create a lifetime alumni address for one graduate
const token = process.env.FORWARD_EMAIL_API_TOKEN;
const response = await fetch('https://api.forwardemail.net/v1/domains/alumni.example.edu/aliases', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token + ':').toString('base64')
  },
  body: JSON.stringify({
    name: 'jane.doe',
    recipients: ['jane@example.com'],
    labels: ['class-of-2025'],
    has_recipient_verification: true
  })
});
const alias = await response.json();
```

To change a destination later, send `PUT /v1/domains/alumni.example.edu/aliases/:alias_id` with new `recipients`. To retire an address, set `is_enabled` to `false`. The [API reference](https://forwardemail.net/en/email-api) lists every field.

## Does the free plan work for alumni email?

The free plan forwards mail with only MX and TXT records and no account. It is meant for your own addresses. On the free plan the forwarding rules live in public TXT records, so anyone can look up where each address forwards. Forward Email's standard terms also do not cover a service used by third parties such as alumni. Paid plans keep aliases out of public DNS, and the Enterprise plan adds a terms exception for third parties and onboarding help. See [Forward Email's Enterprise details](https://forwardemail.net/en/faq#what-is-included-in-the-enterprise-license).
