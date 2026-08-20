# LocalSqueeze

LocalSqueeze is a privacy-first file compression app. JPEG, PNG, WebP, PDF, and MP4 files are processed locally in the browser; no file data is sent to a server.

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

The UI uses `react-dropzone` to accept JPEG, PNG, WebP, PDF, and MP4 files. Each file is read as an `ArrayBuffer` and transferred to `src/workers/image-compression.worker.ts`.

The worker owns a Squoosh `ImagePool` and selects the codec based on the source format:

- JPEG uses `mozjpeg`
- PNG uses `oxipng`
- WebP uses `webp`

PDF jobs use `pdf-lib` to remove document metadata and save with compact object streams. This is lossless structural optimization. `pdf-lib` does not expose a safe embedded-image XObject rewrite API, so the current implementation does not claim to downsample raster images or alter page content.

MP4 jobs use `@ffmpeg/ffmpeg` and `@ffmpeg/core` in the same worker. The command uses H.264 with `-crf 28`, `-preset ultrafast`, AAC audio at `128k`, and `+faststart`. FFmpeg progress events are converted into queue progress updates without blocking React's main thread.

The worker sends progress milestones and either a transferable compressed buffer or an error message back to React. React creates a temporary `Blob` URL for completed files and revokes it when a queue item is removed or the page is unloaded.

Compression quality is controlled in the UI and passed with each job. PDF and video processing share the worker boundary without moving heavy work onto the main thread.

Advanced Settings are optional and collapsed by default. They expose a quality slider from `0%` to `100%` (default `80%`) and dimension scaling at `100%`, `75%`, or `50%`. These values are passed to the worker for image resizing and MP4 video scaling. Progress milestones are exposed through an `aria-live` region for screen readers.

## Project Structure

- `src/App.tsx`: dropzone, worker lifecycle, queue state, result display, and downloads
- `src/workers/image-compression.worker.ts`: Squoosh codec execution and worker message protocol
- `src/components/ui/`: shadcn/ui primitives used by the interface
- `src/index.css`: Tailwind theme tokens and dark default styling

## Privacy and Browser Support

All file reads, codec work, and downloads happen in the browser. The app does not require an account or backend. A browser with module Web Worker, `ArrayBuffer`, and Blob URL support is required.
