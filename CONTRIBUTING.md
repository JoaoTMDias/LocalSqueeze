# Contributing to Squeeezer

Thanks for contributing. Squeeezer is a client-side project, so changes should preserve privacy, accessibility, and browser responsiveness.

## Before you start

1. Check existing issues and pull requests.
2. For a larger change, open an issue first so the design can be discussed.
3. Never commit private example files, generated reports, or user data.

## Local setup

Requirements:

- Node.js 22 or newer
- pnpm 10 or newer
- A browser supported by Playwright for E2E tests

```bash
pnpm install
pnpm dev
```

## Checks

Run the checks relevant to your change:

```bash
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

`pnpm test:e2e` builds the production app, starts Vite Preview, and runs Chromium tests. Install the browser locally when needed:

```bash
pnpm exec playwright install --with-deps chromium
```

## Pull requests

- Keep changes focused and explain the user-visible behavior.
- Add or update Vitest tests for helpers and components.
- Add or update Playwright tests for complete browser workflows.
- Keep heavy processing in Workers and transfer buffers rather than copying them.
- Preserve the no-upload privacy model.
- Consider keyboard access, focus states, contrast, and `aria-live` announcements.
- Document browser limitations and dependency tradeoffs.
- Do not commit `dist`, `playwright-report`, `test-results`, or local logs.

## Adding compression engines

Compression engines must be browser-compatible and self-hostable. Verify the production bundle for Node-only globals such as `__dirname`, `__filename`, `process`, `require`, `fs`, and `worker_threads`. Test actual output in a browser, not only TypeScript compilation.

## Commit messages

Use concise imperative messages, for example:

- `feat: add PDF metadata cleanup`
- `fix: handle empty worker output`
- `test: cover WebP upload flow`
- `docs: explain browser support`
