# CLAUDE.md

Project-specific instructions for Claude Code sessions in this repo. Read this and `~/.claude/CLAUDE.md` at the start of each session.

## What this project is

`<side-note>` — a custom HTML element that turns inline content into a Tufte-style sidenote: a numbered superscript marker stays in the prose where the author placed it, while the note's body floats into the page margin at wide viewports or flows inline as an italic parenthetical at narrow viewports. Framework-agnostic, zero runtime dependencies, ships as both ESM and UMD so it works with a build step or as a plain `<script type="module">` from a CDN.

## Open source

This is an MIT-licensed open source project, designed to be used by anyone, anywhere, with no friction.

- **License:** MIT — anyone can use, modify, redistribute, including commercially.
- **Audience:** any developer dropping the component into any HTML page. Consumers should not need a framework, a build step, or a Node toolchain. Authors writing prose want one inline tag.
- **Third-party deps:** every dependency added — runtime *or* dev — must permit commercial use. No copyleft (GPL, AGPL), no "non-commercial" or "personal use" licenses. When in doubt, check before adding and surface the license to the user.
- **Contribution friendliness:** issues and PRs welcome. Conventions documented here so new contributors can land patches without a long onboarding.

## Conventions

- **TypeScript strict** with `noUncheckedIndexedAccess` and `noImplicitOverride`. ES2022 target.
- **Zero runtime dependencies.** Nothing in `dependencies` of `package.json`. Only `devDependencies`. The published bundle must be standalone.
- **Open shadow root.** Authors should be able to inspect rendered output for debugging. Closed roots block that without a meaningful security benefit for a presentation component.
- **Public API surface** = exported names from `src/index.ts` plus the registered `<side-note>` custom element and its observed attributes. Adding is fine; renaming or removing requires a major version bump.
- **No bespoke linting.** Standard `typescript-eslint` recommended preset and Prettier with defaults. If a rule is fighting us repeatedly, change the code.
- **Comments are rare.** Names carry the "what." Comments explain the "why" only when it would otherwise be invisible — a workaround, a non-obvious invariant, a browser-compat note.

## Workflow

Following the global CLAUDE.md (`~/.claude/CLAUDE.md`):

1. **Plan first** in `tasks/todo.md` for any non-trivial change.
2. **Capture lessons** in `tasks/lessons.md` after corrections, so future sessions don't repeat the same mistake.
3. **Verify before marking done.** Type-check, lint, test, and (for layout/visual changes) confirm with the user that the demo page looks right — Claude can't open a browser.

## Package-manager agnostic

Contributors may use any of npm, pnpm, or bun. Only `package-lock.json` is committed; `pnpm-lock.yaml`, `yarn.lock`, and `bun.lockb` are gitignored. Scripts use bare command names (`vite build`, `vitest`, `eslint`) rather than `npm run` invocations so they work under any package-manager runner. The `packageManager` field is intentionally omitted from `package.json` because it would lock contributors to one tool.

## Test split

- **Vitest** (with `happy-dom`) for unit logic — id generation, shadow tree shape, ARIA wiring, attribute-driven CSS variable setting, layout-module registration lifecycle. Runs in CI on every change once CI lands.
- **Playwright** for real-browser layout verification — collision stacking, narrow-viewport clear-and-fall-back, resize lifecycle. Runs against the demo site under `vite dev`. Three projects: Chromium, Firefox, WebKit. Run `npx playwright install` once before `npm run test:e2e`.

## Roadmap

See README's Roadmap section for what's shipped vs planned. Currently on **milestone 2 of 4**: bare element with wide-viewport margin display, narrow-viewport inline display, `inline` attribute for force-inline, and collision-aware stacking at wide viewports.
