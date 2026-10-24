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

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
