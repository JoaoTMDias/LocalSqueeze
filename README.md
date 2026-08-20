# Squeeezer

Squeeezer is a privacy-first file compression app for the browser. JPEG, PNG, WebP, SVG, PDF, and MP4 files are processed locally on the user's device. Files are not uploaded to a server.

## Features

- JPEG, PNG, and WebP image compression in a dedicated Web Worker
- PDF metadata and structural optimization with `pdf-lib`
- MP4 H.264 transcoding with FFmpeg Wasm
- Optional quality and dimension controls
- Transferable `ArrayBuffer` worker protocol
- Progress updates in the queue and through an `aria-live` region
- Downloadable results with temporary browser Blob URLs
- Dark interface designed for keyboard and screen-reader use

## Requirements

- Node.js 22 or newer
- pnpm 10 or newer
- A modern browser with Web Worker, WebAssembly, Blob URL, and file API support

## Development

```bash
pnpm install
pnpm dev
```

The development server is then available at the URL printed by Vite.

## Deploying to Netlify

The repository includes [netlify.toml](netlify.toml) with the required settings:

- Build command: `pnpm build`
- Publish directory: `dist`
- Node.js: `22`
- WebAssembly MIME type and SPA fallback configuration

To deploy through the Netlify dashboard:

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. In Netlify, choose **Add new site** and **Import an existing project**.
3. Select the repository and keep the detected settings from `netlify.toml`.
4. Deploy the site.

Netlify will run the build on every push to the connected production branch. The application is fully client-side; no environment variables or backend service are required. After deployment, test image, PDF, and MP4 processing from the deployed URL because WASM asset loading must be verified in the production environment.

## Verification

Run the unit/component tests:

```bash
pnpm test
```

Run linting:

```bash
pnpm lint
```

Create a production build:

```bash
pnpm build
```

Run the browser E2E suite against a production preview:

```bash
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
```

The E2E suite verifies that the built app can load codec assets, upload a PNG, receive Worker progress, reach completion, and expose the download action. It also checks the optional Advanced Settings controls.

## Architecture

The main application coordinates state and owns the Worker lifecycle. Presentational responsibilities are split into focused components:

- `src/components/app-header.tsx`: branding and client-side status
- `src/components/image-dropzone.tsx`: accepted formats and native file input
- `src/components/compression-controls.tsx`: presets and optional advanced controls
- `src/components/compression-queue.tsx`: progress, savings, and downloads
- `src/lib/compression.ts`: shared formats, queue types, and helpers
- `src/workers/image-compression.worker.ts`: image, PDF, and MP4 processing

### Image processing

Image jobs use browser-focused jSquash codecs:

- `@jsquash/jpeg` for JPEG encoding
- `@jsquash/oxipng` for lossless PNG optimization
- `@jsquash/webp` for WebP encoding
- `createImageBitmap` and `OffscreenCanvas` for decoding and resizing

The app intentionally does not use `@squoosh/lib`; that package is a stale Node-oriented library and is not suitable for this browser Worker architecture.

### PDF processing

PDF jobs use `pdf-lib` to remove document metadata and save with compact object streams. This is lossless structural optimization. Embedded image rasterization/downsampling is not currently performed because `pdf-lib` does not expose a safe public XObject rewrite API.

### Video processing

MP4 jobs use `@ffmpeg/ffmpeg` and `@ffmpeg/core` in the Worker with H.264, CRF 28, ultrafast preset, AAC audio, and fast-start output. FFmpeg progress events are mapped to queue progress updates.

## Privacy and browser behavior

Compression happens locally. The app does not require an account, backend, or runtime CDN asset. WASM files are emitted and served as application assets.

The Worker protocol transfers input and output buffers rather than copying them. Completed output is represented by a temporary Blob URL, which is revoked when a queue item is removed or the app is unloaded.

Large files can require substantial memory. Process one file at a time when working near browser limits, and test target browsers before deploying a public instance.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Please add tests for behavior changes and preserve the no-upload, Worker-based design.

Security issues should be reported according to [SECURITY.md](SECURITY.md), not through a public issue. Community participation follows [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Branding

The source code is available under the MIT License. “Squeeezer” and the project logo are project branding and are not granted for use as the name or identity of modified or hosted versions. Forks are welcome; please use a distinct name and visual identity so users can tell them apart from the official project.

## Known limitations

- PNG quality is lossless optimization rather than JPEG-style perceptual quality.
- PDF image downsampling is not implemented.
- MP4 processing requires enough browser memory for FFmpeg Wasm.
- Browser codec and OffscreenCanvas support varies by browser version.
- The project currently targets Chromium in automated E2E tests; Firefox and Safari still require release-matrix validation.

## License

The source code is licensed under the [MIT License](LICENSE). Third-party dependencies retain their own licenses; consult their documentation and package metadata when redistributing a built bundle.
