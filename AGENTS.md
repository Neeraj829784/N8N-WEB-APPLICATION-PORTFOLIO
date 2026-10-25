# Project

This repository is a portfolio web application built with Next.js, React, TypeScript, and Tailwind CSS. Application routes live in `src/app`, reusable interface primitives in `src/components/ui`, portfolio sections in `src/components/sections`, structured content in `src/data`, and shared helpers in `src/lib`.

# Development

Use npm for dependency management.

- Start development: `npm run dev`
- Lint: `npm run lint`
- Type-check: `npm run typecheck`
- Production build: `npm run build`

Run lint and type-check after source changes. Run the production build before declaring a substantial implementation complete.

# Documentation

When you need to search library documentation, use Context7.

# Portfolio UI

Use the official project-scoped 21st skills for portfolio interface work: explore design directions with `21st-ui-explore`, implement the chosen direction with `21st-ui-build`, and audit the result with `21st-ui-review`. Use the other installed 21st skills when their descriptions match the request. Do not publish or delete 21st registry content unless the user explicitly requests it.

# GitHub

Use the project-scoped GitHub MCP server for live GitHub information and remote repository operations. Use local Git commands for worktree inspection and local source-control operations.

Prefer read-only GitHub tools while investigating. Before any remote write, confirm the intended repository, branch, issue, pull request, release, workflow, or other target. Never delete repositories or branches, merge or close pull requests, publish releases, change repository or organization settings, manage secrets, alter governance rules, or trigger/cancel workflows unless the user explicitly requests that exact action.

Keep the GitHub personal access token outside the repository. The MCP configuration reads it from `GITHUB_PERSONAL_ACCESS_TOKEN`; never print, log, commit, or place its value in project files. If authentication is unavailable after the token was configured, ask the user to restart Codex or the IDE before changing the MCP configuration.

# Task completion and deployment

The owner requires completed project changes to be published, not left only in the local worktree. Unless the owner explicitly requests local-only work or postpones publishing, finish each implementation task or agreed milestone by:

1. Running checks appropriate to the change (lint, type-check, tests, and a production build for application changes). Do not publish a known-broken change.
2. Reviewing the diff and committing/pushing only the task's intended files to `Neeraj829784/N8N-WEB-APPLICATION-PORTFOLIO`, branch `main`. Preserve unrelated user changes and never publish secrets, `.env.local`, or local MCP credentials.
3. Deploying the pushed commit to the existing Vercel project `neerajwork-portfolio` (`prj_HwjeOoeSCpxwV9Nf3mjm3N519AOE`), team `team_8NGoRpYA0kmXLhxmvDD1oltu`. Do not assume a GitHub push deploys automatically; verify the project's Git connection or deploy the exact committed source through the project-scoped Vercel MCP.
4. Waiting for the deployment to reach `READY`, confirming `https://portfolio.neerajwork.in` uses that deployment, and smoke-testing the affected behavior. Report the commit and live result, or clearly identify any blocked publication/deployment step; local completion alone is not full completion.

This is standing authorization for ordinary task-scoped commits, pushes, and deployments to these existing targets, not for unrelated account changes, destructive operations, billing upgrades, or enabling search indexing. Keep `SITE_INDEXABLE=false` until the owner approves indexing. Keep website enquiries addressed only to `neerajautomations@zohomail.in`; the Resend account login may remain `neerajvasupalli200@gmail.com`. Do not send real test emails unless required by the requested task and directed only to an owner-controlled inbox.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
