# Vasupalli Neeraj — automation portfolio

A personal portfolio and enquiry website built with Next.js, React, TypeScript, and Tailwind CSS. The charcoal/orange design includes labelled example projects and accessible, reduced-motion-friendly interactions.

## Run locally

Use Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. To review a production build:

```sh
npm run build
npm run start
```

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

The tests cover enquiry validation, oversized/malformed requests, origin checks, delivery failures, rate-limit recovery, and production URL configuration. `.github/workflows/ci.yml` runs these checks on pushes and pull requests after the source is committed and pushed. The workflow uses the versions documented by [GitHub's Node setup action](https://github.com/actions/setup-node#usage).

Browser checks require Chrome with remote debugging on localhost:9227 and the app on localhost:3000:

```sh
npm run qa:browser
npm run qa:launch
npm run qa:navigation
```

The launch check uses axe-core, tests both enquiry modes, and mocks delivery responses inside the browser. It never sends a real enquiry. Screenshots and audit JSON files use the ignored `qa-*` prefix. Its local LCP/CLS readings are diagnostic measurements, not a real-device performance guarantee.

The navigation check opens a temporary browser tab and verifies section highlighting, command-menu fragments and Back/Forward history, keyboard selection, and Windows/macOS shortcut hints. It never fills or submits the contact form. Set `QA_ORIGIN` to test another local port and `QA_CDP_URL` to use another isolated Chrome debugging endpoint.

## Deployment and configuration

The portfolio is deployed on Vercel at https://portfolio.neerajwork.in. Hostinger manages its DNS; the root domain and email records are separate and unchanged. Resend has verified `notify.neerajwork.in`, and the sender is `enquiries@notify.neerajwork.in`. The private sending key is configured as a production-only sensitive variable in Vercel and in the ignored local `.env.local`, never in Git. A real local-browser enquiry test succeeded, with Resend reporting Delivered; a production inbox test remains pending. See [the domain setup record](docs/domain-setup.md) for verification and remaining launch steps.

The initial deployment used the reviewed Git commit's files directly because Vercel's GitHub login connection is not configured. GitHub pushes do not currently deploy automatically. Connect the intended GitHub account and repository in Vercel before relying on automatic deployments. Search indexing remains disabled until launch approval.

Copy `.env.example` to `.env.local` for local configuration, or set the same values in the hosting environment. Actual `.env` files and local `.codex` account configuration are ignored by Git.

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | The final HTTPS origin, without a path, query, or credentials. |
| `SITE_INDEXABLE` | Set to `true` only when the public site is ready for search engines. |
| `RESEND_API_KEY` | Server-only sending API key for automatic enquiry emails. |
| `CONTACT_FROM_EMAIL` | Bare sender address on your verified Resend domain. |
| `CONTACT_TO_EMAIL` | Destination inbox; defaults to the profile email. |
| `CONTACT_WEBHOOK_URL` | The server-only HTTPS destination for enquiries; supports an n8n webhook. |
| `CONTACT_WEBHOOK_TOKEN` | Optional server-only Bearer token for that webhook. |

Redeploy after changing hosting environment variables. Restart the local server after changing delivery credentials; the contact form checks delivery availability at runtime. Never use `NEXT_PUBLIC_` for delivery credentials.

With no configuration, the site remains a preview: noindex metadata, a blocking robots file, an empty sitemap, and local-only brief preparation/download. The server returns an unavailable response rather than pretending a message was sent.

The profile email is configured, so visitors can also contact Neeraj directly or open a prefilled email draft after preparing a brief. They review and send it in their own email app. This path needs no webhook or always-on n8n server; direct automatic form delivery remains optional.

For automatic delivery without n8n, configure Resend's key and a verified sender address. The form collects the visitor's name and reply email, discloses Resend processing, and submits through `/api/contact`. Neeraj receives the brief with the visitor as Reply-To. Success confirms provider acceptance, not inbox delivery. Loading, failure, stable-ID retries, and downloadable fallback states are implemented. See [email setup and the launch test](docs/email-delivery.md).

The webhook remains an optional alternative when the Resend key and sender are both blank. Partial email configuration disables delivery instead of falling back. A webhook receiver must acknowledge only after accepting the enquiry. See [the webhook contract](docs/contact-webhook.md).

## Personal and project content

Edit `src/data/portfolio.ts` when the client's email, biography, social links, and real projects arrive. The name is already Vasupalli Neeraj and the monogram is VN. Title metadata and the social preview follow the profile name automatically. Initials are also present in `src/app/icon.svg`.

Projects must remain labelled examples until real evidence is supplied. Never invent client names, testimonials, or results. See [CONTENT.md](CONTENT.md) for replacement guidance.

## Publish when details are ready

1. Add the real profile details and confirm external links.
2. Configure the final `SITE_URL`, Resend sending key, verified sender address, and destination inbox in the hosting environment.
3. Deploy to a host that runs Next.js server routes; a static-file-only host cannot run the enquiry endpoint.
4. Test a real enquiry, inbox arrival, and Reply-To behavior; configure shared host-level rate limiting for `/api/contact`.
5. Confirm the production canonical URL, social image, sitemap, HTTPS, and mobile layout.
6. Set `SITE_INDEXABLE=true`, rebuild, and redeploy when approved for public indexing.

The endpoint includes a honeypot, a bounded request body, and best-effort in-memory rate limiting. On a multi-instance/serverless deployment, use the host's shared rate-limiting controls too. The reverse proxy must supply trusted client IP headers rather than forwarding attacker-provided values. No enquiry bodies are stored or logged by this application. Resend and the receiving inbox process the email data. This implementation has no durable queue or background retry worker.

Keep webhook tokens and personal account settings out of commits. The repository includes application source, tests, CI, setup documentation, and project-specific design skills. Secrets, local account configuration, generated output, old design experiments, unused artwork, and private DNS recovery notes are excluded by `.gitignore` and remain local. Deployment is a separate step from pushing source to GitHub.
