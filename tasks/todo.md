# Milestone 1 — `<side-note>` bare element

Plan file: `~/.claude/plans/lets-build-this-project-snappy-diffie.md`

## Implementation

- [x] git init in marginalia/
- [x] `package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, `.eslintrc.cjs`, `.prettierrc.json`
- [x] `LICENSE` (MIT, 2026, Troels Lauritz Reese Christensen)
- [x] `README.md` (public-facing, status banner, install, quickstart, attributes, props, roadmap)
- [x] `CLAUDE.md` (open-source positioning + project conventions)
- [x] `src/side-note.ts` — `SideNote` class
- [x] `src/index.ts` — register + export
- [x] `examples/index.html` — demo page
- [x] `test/side-note.test.ts` — Vitest specs
- [x] `tasks/todo.md`, `tasks/lessons.md`

## Verification

- [ ] `npm install` succeeds
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes (no warnings)
- [ ] `npm test` — all Vitest specs pass
- [ ] `npm run build` produces `dist/index.js`, `dist/index.umd.js`, `dist/index.d.ts`
- [ ] **User-run:** `npm run dev`, open `http://localhost:5173/examples/index.html`, confirm at viewport ≥ 1100px:
  - Each paragraph's note appears in the right margin (or left for `side="left"`)
  - Markers `1` `2` `3` appear inline as superscripts
  - Note in margin is prefixed with the same number
  - The `label="*"` example shows `*` instead of a number both inline and in the margin

## Out of scope (later milestones)

- Popover / responsive switching → milestone 2
- Collision detection → milestone 3
- Print stylesheet → milestone 3
- Documentation site → milestone 4
- npm publish, GitHub remote, CI workflows — defer until milestone 1 is reviewed
