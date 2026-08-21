# Coding agent guide

## Repository shape

- This is currently one private pnpm package, despite the lockfile's workspace-style `importers` section; there is no `pnpm-workspace.yaml` or nested package.
- Use Node.js 22+ and pnpm 10+. Keep `pnpm-lock.yaml` in sync when dependencies change, but note that Prettier intentionally ignores it.
- The app is a React 19, TypeScript, Vite, Tailwind CSS 4, and shadcn/Base UI client-side PWA. It has no backend or runtime environment variables.

## Where code belongs

- `src/App.tsx` owns queue state, the compression Worker lifecycle, announcements, service-worker updates, and Blob URL cleanup.
- `src/components/` contains feature components; `src/components/ui/` contains reusable shadcn-style primitives.
- `src/lib/compression.ts` is the shared public contract for formats, queue entries, Worker responses, and format/size helpers. Keep producers and consumers synchronized when changing these types.
- `src/lib/i18n.tsx` owns English and European Portuguese messages, locale persistence, and number formatting. Add every user-facing string to both locales.
- `src/workers/image-compression.worker.ts` contains CPU-heavy image, SVG, PDF, and MP4 work. Keep heavy processing off the main thread.
- `e2e/` contains Playwright tests against the built app served by Vite Preview.
- Prefer the `@/` alias for imports under `src`.

## Architectural invariants

- Preserve the privacy model: file bytes stay in the browser and are never uploaded or sent to analytics or a backend.
- Preserve the Worker message contract. Input and output `ArrayBuffer`s are transferred, not copied; use `satisfies WorkerResponse` for responses and update the shared union when adding message variants.
- Revoke temporary Blob URLs when files are removed, the queue is cleared, or the app unmounts.
- Keep compression engines browser-compatible and self-hosted. Do not introduce Node-only globals or runtime CDN dependencies. Validate WASM/codec loading in a production browser build.
- When adding a format, update together: `FileFormat`, format detection, dropzone MIME/extensions and badges, Worker dispatch/output MIME type, queue presentation, translations, and tests.
- SVG input must remain validated before and after optimization; do not weaken the active-content checks. PDF optimization is intentionally lossless and does not rasterize embedded images.
- Maintain keyboard access, visible focus, accessible names, semantic markup, reduced-motion behavior, and useful `aria-live` announcements.

## Implementation conventions

- TypeScript is strict about unused code, fallthrough, erasable syntax, and type-only imports. Follow existing ESM and React function-component patterns.
- Reuse components from `src/components/ui/` and existing design tokens in `src/index.css`; avoid one-off primitives or hard-coded colors when a token exists.
- Keep responsive behavior intact from the 320px minimum viewport upward.
- Do not edit generated output or reports: `dist/`, `playwright-report/`, `test-results/`, or `coverage/`.
- For user-facing changes, add a focused `.changeset/*.md`; this private package is versioned with Changesets but is not published to npm.

## Tests and validation

- Co-locate Vitest tests as `*.test.ts` or `*.test.tsx`. Component tests use Testing Library, `jest-dom`, semantic queries, and `LocaleProvider`; mock callbacks with `vi.fn()`.
- Add helper/contract tests for pure logic and component tests for visible behavior and accessibility. Add or update Playwright coverage for complete browser workflows, Worker/codecs, PWA behavior, or production-only asset loading.
- Run the narrowest relevant test while iterating, then the applicable checks:

```bash
pnpm test -- src/lib/compression.test.ts
pnpm lint
pnpm test
pnpm build
pnpm format:check
pnpm test:e2e # builds first; requires Playwright Chromium
```

- `pnpm release:check` runs lint, all Vitest tests, and the production build. CI additionally runs the Chromium E2E suite.
- Do not claim E2E coverage from jsdom tests alone: actual compression depends on Web Workers, browser APIs, WASM, and production asset URLs.

## Before handing off

- Keep changes focused and report which checks ran. Document any unrun check or browser limitation.
- Re-read `README.md` and `CONTRIBUTING.md` when behavior, supported formats, architecture, deployment, or release workflow changes, and update them when needed.
- Never commit private sample files, user data, generated reports, local logs, or security details; follow `SECURITY.md` for vulnerability reporting.
