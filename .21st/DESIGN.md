# Project Design Context

## Current identity: Personal automation portfolio

The user selected a dark automation reference with warm orange highlights. Near-black #0c0e12, charcoal surfaces, off-white type, and orange #ff9b6a replace the earlier blue and pink palettes. Shared tokens live in src/app/globals.css; composition and responsive refinements live in src/app/portfolio.css.

The hero pairs a personal introduction with a level workflow canvas. A static orange glow and fading grid give the hero depth. The decorative blue globe has been removed. Official n8n connected-circle artwork keeps its original coral colour and proportions; it identifies the platform only. The personal initials mark identifies the freelancer.

Workflow offerings retain CSS layered screens and restrained depth on hover or keyboard focus. Neutral charcoal screens and warm highlights carry the theme through workflow visuals, delivery, profile, toolkit, and contact. Smaller body text and diagram labels have been enlarged.

All three narrative points (the challenge, what I can build, the goal) use the same subtle orange-tinted panel, orange heading and left border, spacing, and body typography. The goal has no exclusive highlighting. This applies consistently to every workflow and viewport.

Visual QA refinements: navigation switches to the compact menu below 1024px; the hero stacks below 1101px and stays aligned to the content gutter. Container queries enlarge the central project screen in narrow cards, leaving side screens decorative. Tool tags share a consistent height while preserving the original logo proportions. Phone project filters use a visible two-column layout. Enquiry inputs use 16px type, service choices have 44px targets, and small metadata and helper text use readable sizes.

## Content and composition

Present LeadFlow, WelcomeOps, and SignalDigest as workflows Neeraj can build for clients. The owner requested a client-facing portfolio without repeated example badges, illustrative-system labels, numbered system briefs, or textbook captions. Put each workflow's name and purpose before its visual, and place technical steps inside a native How it works disclosure. No fake live execution indicators. Never claim delivered client work, measured results, testimonials, or credentials without evidence. Personal details remain in src/data/portfolio.ts; guidance lives in CONTENT.md.

The page includes hero, projects, services, delivery, toolkit, profile, process, FAQ, and contact. The removed workflow playground stays removed. The contact section prepares text locally until server-side delivery is configured. Resend email is the recommended delivery path; an HTTPS webhook remains optional. Configured mode adds visitor reply fields, an explicit send action, validation errors, pending/accepted states, and a preserved downloadable brief after failure. Email drafting also becomes available when a real profile email is configured. Resend processing is disclosed before submission. Success means provider acceptance with a message ID, not confirmed inbox delivery. Preserve the existing charcoal/orange form composition and shared components.

## Accessibility and verification

Preserve keyboard controls, visible orange focus outlines, native disclosures, mobile navigation, and reduced motion. The workflow canvas has an explicit pause control and pauses its animation off screen. The hero glow is static. Layouts must fit down to 320px.

Scrolling keeps every section at full opacity with no section translation. Individual cards have a single 320ms entrance from 94% opacity and a 6px offset; focused cards stay fully readable. The previous nested section/card fade and competing project entry animation were removed after the user's scroll review. Hover depth, the sticky header, reading progress, and off-screen workflow pausing remain independent.

Run npm run lint, npm run typecheck, npm run build, and scripts/qa-browser.mjs against the local preview. The browser script expects the current charcoal background and warm orange accent.


