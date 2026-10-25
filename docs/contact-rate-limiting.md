# Shared contact-form rate limiting

## Active protection

On 2026-10-25, a custom rule was published in the existing Vercel project's Firewall dashboard:

- Project: `neerajwork-portfolio` (`prj_HwjeOoeSCpxwV9Nf3mjm3N519AOE`).
- Team: `team_8NGoRpYA0kmXLhxmvDD1oltu`; Hobby plan, no plan upgrade.
- Rule: `Portfolio contact enquiry rate limit`.
- Rule ID: `rule_portfolio_contact_enquiry_rate_limit_xo6HcH`.
- Match: normalized request path `^/api/contact/?$` **AND** method `POST`.
- Counter: client IP only; fixed 60-second window, five attempts.
- Excess requests: Vercel returns HTTP **429**, before the Next.js function or Resend runs.

The rule applies to the project rather than just one hostname, including the custom domain and the public `.vercel.app` fallback. GET delivery-status requests, page visits, and assets do not consume this rule's bucket. The application's existing five-attempt in-memory limiter remains an additional best-effort guard.

Vercel's counters are shared across application instances **within an ingress region**, not globally synchronized between regions. Fixed-window boundaries can permit adjacent-window bursts. Shared networks/NATs also share an IP allowance. This is not an exact global daily email cap and does not prevent attackers rotating real IPs; monitor Resend usage and review further controls if abuse appears.

## Reproducible definition and changes

[`ops/contact-rate-limit.json`](../ops/contact-rate-limit.json) records the published rule without generated IDs. **Committing/deploying that file does not apply firewall changes automatically.** It is a reviewed definition for comparison or recreation through Vercel's dashboard/API.

For changes, use the existing project's Firewall → Rules → the named rule, review the conditions and counting keys, then review and publish only the intended change. Do not replace unrelated rules or enable paid features. To roll back only this protection, disable this named rule and publish; the application limiter remains. Re-run the checks after changing hosts, migrating the project, or changing the rule.

During initial setup the project-scoped MCP firewall endpoints returned `404: Seawall Config not found`, including the documented create operation. The logged-in dashboard was used instead. The dashboard's active configuration read confirmed firewall enabled, rule active/valid, five requests per 60 seconds, and IP-only counting after publication. Other settings, email credentials, DNS, billing, and indexing were unchanged.

## No-email live verification

```sh
npm run qa:rate-limit
# Wait at least 65 seconds without other contact POSTs from the same public IP.
npm run qa:rate-limit -- --recovery
```

These are explicit **live** checks against the portfolio's two owned public URLs, not local simulations. Start the burst check after a quiet window. It sends at most eight POSTs; each has a nonempty honeypot and lacks required enquiry fields, so it cannot send email. It alternates hostnames and varies untrusted forwarded-IP headers. The first five responses must be application validation failures; subsequent responses must have Vercel's edge 429 payload, including its matching request ID. An application-only 429 is not sufficient proof. The eighth attempt checks the optional trailing slash. It also confirms homepage and contact-status GETs still work.

The recovery command sends just two invalid attempts, one per domain, and expects application validation again. The script never creates a valid enquiry, reads credentials, or changes firewall settings. Unit tests mock all traffic and guard the rule definition and QA behavior.

Live verification on 2026-10-25 showed five validation responses followed by edge 429s on both public hostnames, despite changing spoofed forwarded-IP headers. The repeatable script also confirmed trailing-slash protection and unaffected homepage/status GETs. After the window expired, the recovery check returned normal validation responses on both domains. No real email was sent.

Official references: [Vercel rate limiting, plan limits and regional counters](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting), [custom rule publishing](https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules), and [usage/pricing](https://vercel.com/docs/vercel-firewall/vercel-waf/usage-and-pricing).
