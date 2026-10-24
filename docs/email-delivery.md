# Automatic portfolio enquiry emails

The form sends a validated enquiry to the existing Next.js `POST /api/contact` route. That route calls Resend's HTTPS API and emails the configured inbox. It does not require an n8n workflow, VPS, or the developer's computer to stay on.

## Configuration

Use the server-side environment variables in `.env.example`:

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | A sending API key from your Resend account. |
| `CONTACT_FROM_EMAIL` | A bare sender address on a domain you have verified in Resend, such as `enquiries@your-domain.com`. Do not use your Gmail address as the sender. |
| `CONTACT_TO_EMAIL` | `neerajvasupalli200@gmail.com`. If omitted, it defaults to the email in `src/data/portfolio.ts`. |
| `SITE_URL` | The final public HTTPS origin, for example `https://your-domain.com`. |

Never prefix credentials with `NEXT_PUBLIC_`. Enter actual keys in the hosting platform's environment-variable settings or your ignored `.env.local`, not in source code or chat. Do not commit `.env.local`.

The recipient and sender are fixed by server configuration. Visitor input cannot change either. The visitor's validated email is used only as `Reply-To`, so replying from the inbox addresses that visitor. No automatic confirmation is sent to visitor addresses.

When a key or sender is present, both must be valid before automatic email submission is enabled. An incomplete email setup disables delivery; it never silently switches to an old webhook. When both are blank, the existing optional HTTPS webhook can still be used. With neither mode configured, visitors can prepare, download, or open an email draft of their brief locally.

## Deploy on Vercel or Netlify

1. Create a Resend account, verify your sending domain using its DNS instructions, and create a sending API key.
2. Configure the four variables above in the hosting platform. Keep `SITE_INDEXABLE=false` until the public site is approved for indexing.
3. Deploy this project using the host's Next.js framework support, not static export. The standard build command is `npm run build`. The API route needs server-side execution.
4. After changing environment variables, redeploy. For local testing, restart the server.
5. Submit one legitimate test enquiry using an email address you control. Confirm that the message arrives in Neeraj's inbox (check spam too), all brief fields are readable, and Reply addresses the test visitor.
6. Check the Resend dashboard for acceptance/delivery or bounce events. Only turn on `SITE_INDEXABLE=true` when the rest of the launch checklist is complete.

Next.js server routes run on demand when a request arrives. The site does not need a continuously running application process, but availability remains subject to the hosting and mail providers' quotas, billing status, and outages. Verify that the selected hosting plan permits this commercial portfolio's usage.

## What success means

The API waits up to eight seconds for Resend. It reports success only after a successful response containing a message ID. The visitor sees **accepted for email delivery**, not a claim that the email has reached the inbox. Rejection, timeout, malformed responses, and network failure show an error and preserve the downloadable brief and email-draft fallback.

An unchanged form reuses its enquiry ID on retry. This becomes the `Idempotency-Key` sent to Resend, with an identical email payload even when the retry happens later. Resend retains these keys for 24 hours. Editing the form starts a new enquiry. There is no durable queue or background retry worker in this application; the visitor can retry after a failure or use the fallback email draft.

## Privacy and abuse protection

The form discloses before submission that Resend processes the visitor's name, email, and project details for delivery to Neeraj. It asks visitors not to include sensitive information. This application does not store or log enquiry bodies; the receiving inbox and Resend process and may retain email data under their respective settings and policies.

Existing controls include shared client/server validation, a 16KB body limit, same-origin checks, a honeypot, a fixed recipient, and a best-effort five-attempts-per-minute limit per client key per running instance. In-memory limiting is **not a distributed limit**: configure the host's shared firewall/rate-limit controls for `/api/contact` before public launch, and monitor mail quota usage. Only trusted hosting proxies should supply client IP headers. These controls reduce basic abuse; they do not make the endpoint spam-proof.

## Verification

`npm test` mocks the provider and covers configuration, HTML escaping, address/header injection, fixed-recipient forwarding, identical retries, failures, missing receipts, timeouts, and attempt limits. `npm run qa:launch` mocks browser delivery responses, checks disclosure, validation, pending/error/success states, and accessibility. Neither sends real mail. A real inbox-delivery test remains required after credentials are configured.

Official references: [Resend email API](https://resend.com/docs/api-reference/emails/send-email), [idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys), [Next.js setup and prerequisites](https://resend.com/docs/send-with-nextjs), [Vercel Functions](https://vercel.com/docs/functions), and [Netlify Next.js support](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/).
