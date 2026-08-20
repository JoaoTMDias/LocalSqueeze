import { ImagePool } from "@squoosh/lib"

type ImageFormat = "jpeg" | "png" | "webp"

/** Job sent from the UI thread. The file buffer is transferred, not copied. */
type CompressRequest = {
  id: string
  file: ArrayBuffer
  format: ImageFormat
  quality: number
}

/** Progress and result messages returned to the UI thread. */
type CompressResponse =
  | { type: "progress"; id: string; progress: number }
  | { type: "complete"; id: string; buffer: ArrayBuffer; mimeType: string }
  | { type: "error"; id: string; message: string }

// Keep codec work and Squoosh's own pool off the React main thread.
const imagePool = new ImagePool(1)

self.onmessage = async ({ data }: MessageEvent<CompressRequest>) => {
  const { id, file, format, quality } = data

  try {
    self.postMessage({ type: "progress", id, progress: 5 } satisfies CompressResponse)
    const image = imagePool.ingestImage(file)
    await image.decoded
    self.postMessage({ type: "progress", id, progress: 35 } satisfies CompressResponse)

    if (format === "jpeg") {
      await image.encode({ mozjpeg: { quality } })
    } else if (format === "png") {
      await image.encode({ oxipng: {} })
    } else {
      await image.encode({ webp: { quality } })
    }

    self.postMessage({ type: "progress", id, progress: 85 } satisfies CompressResponse)
    const codec = format === "jpeg" ? "mozjpeg" : format === "png" ? "oxipng" : "webp"
    const result = image.encodedWith[codec]

    if (!result) throw new Error("The image codec returned no output.")

    const buffer = new ArrayBuffer(result.binary.byteLength)
    new Uint8Array(buffer).set(result.binary)
    const mimeType = format === "jpeg" ? "image/jpeg" : `image/${format}`
    self.postMessage({ type: "complete", id, buffer, mimeType } satisfies CompressResponse, { transfer: [buffer] })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image compression failed."
    self.postMessage({ type: "error", id, message } satisfies CompressResponse)
  }
}
