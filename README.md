# LocalSqueeze

LocalSqueeze is a privacy-first image compression app. JPEG, PNG, and WebP files are processed locally in the browser; no file data is sent to a server.

## Development

```bash
pnpm install
pnpm dev
```

Create a production build with:

```bash
pnpm build
```

Run the linter with:

```bash
pnpm lint
```

## How Processing Works

The UI uses `react-dropzone` to accept JPEG, PNG, and WebP files. Each file is read as an `ArrayBuffer` and transferred to `src/workers/image-compression.worker.ts`.

The worker owns a Squoosh `ImagePool` and selects the codec based on the source format:

- JPEG uses `mozjpeg`
- PNG uses `oxipng`
- WebP uses `webp`

The worker sends progress milestones and either a transferable compressed buffer or an error message back to React. React creates a temporary `Blob` URL for completed files and revokes it when a queue item is removed or the page is unloaded.

Compression quality is controlled in the UI and passed with each job. The current queue is intentionally image-only; PDF and video processing can be added as separate workers without moving heavy work onto the main thread.

## Project Structure

- `src/App.tsx`: dropzone, worker lifecycle, queue state, result display, and downloads
- `src/workers/image-compression.worker.ts`: Squoosh codec execution and worker message protocol
- `src/components/ui/`: shadcn/ui primitives used by the interface
- `src/index.css`: Tailwind theme tokens and dark default styling

## Privacy and Browser Support

All file reads, codec work, and downloads happen in the browser. The app does not require an account or backend. A browser with module Web Worker, `ArrayBuffer`, and Blob URL support is required.
