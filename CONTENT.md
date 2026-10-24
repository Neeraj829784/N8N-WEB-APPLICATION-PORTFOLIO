# Replacing the example content

The design is complete with illustrative projects. Profile, services, projects, toolkit, and delivery-process content live in `src/data/portfolio.ts`.

## Profile

Replace `name`, `shortName`, `location`, `email`, `intro`, `about`, and `socialLinks`. The header, personal sections, and footer use these values.

The title and author metadata in `src/app/layout.tsx` read the name from the profile automatically. The current identity is Vasupalli Neeraj, with the initials VN; update `src/app/icon.svg` as well if the initials change.

## Project case studies

Each object in `portfolio.projects` provides:

- A unique `id`, `category`, `title`, and `subtitle`.
- `problem` and `solution` paragraphs.
- A `features` list and an `outcome`.
- An ordered `flow` describing the architecture.
- A `tools` list and an `icon` name.

Categories are generated automatically from the data. The list can grow beyond the initial three examples.

When replacing examples with genuine work, update the example labels and introductory copy in `src/components/sections/work-section.tsx`. Describe the actual outcome and your contribution. Add real project links only when available.

The current page does not claim client results, credentials, testimonials, or completed deployments.

## Contact behaviour

With no delivery configuration, the form validates and prepares a brief in the browser. Visitors can download it as a text file. No enquiry data is submitted in this mode.

The supplied profile email enables a direct contact link and an email-draft link after a brief is prepared. This opens the visitor's email application; it is separate from automatic backend email delivery.

For automatic email delivery without n8n, set server-only `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` (on a verified domain), and `CONTACT_TO_EMAIL` (the owner's inbox). The form collects a visitor name and reply email and sends the validated enquiry through `/api/contact`. Reply-To addresses the visitor; success means Resend accepted the email, not guaranteed inbox arrival. See `README.md` and `docs/email-delivery.md`. Credentials and a real inbox test are still required.

The optional `CONTACT_WEBHOOK_URL` and `CONTACT_WEBHOOK_TOKEN` remain supported only when the Resend key and sender are both blank. See `docs/contact-webhook.md` for that alternative.

Set `SITE_URL` to the final HTTPS origin and `SITE_INDEXABLE=true` only when launching. Until then, robots and metadata keep the preview unindexed. Canonical metadata, sitemap, and sharing images are implemented and follow the site/profile configuration.

## Local development

- `npm run dev`: development server.
- `npm run lint`: source checks.
- `npm run typecheck`: TypeScript checks.
- `npm run build`: production build.
- `npm run start`: serve the production build.

The optional browser QA helper, `node scripts/qa-browser.mjs`, expects the site on port 3000 and an isolated Chrome DevTools session on localhost port 9227. It writes temporary `qa-*.png` screenshots.
