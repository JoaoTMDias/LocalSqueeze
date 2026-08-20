import { FFmpeg } from "@ffmpeg/ffmpeg"
import { PDFDocument } from "pdf-lib"
import { ImagePool } from "@squoosh/lib"

import type { FileFormat, ImageFormat, WorkerResponse } from "@/lib/compression"


type CompressRequest = {
  id: string
  file: ArrayBuffer
  format: FileFormat
  quality: number
}

type WorkerScope = {
  onmessage: ((event: MessageEvent<CompressRequest>) => void) | null
  postMessage: (message: unknown, options?: StructuredSerializeOptions) => void
}
const worker = self as unknown as WorkerScope
const imagePool = new ImagePool(1)

const ffmpeg = new FFmpeg()
let ffmpegLoadPromise: Promise<boolean> | undefined


function postProgress(id: string, progress: number) {
  worker.postMessage({ type: "progress", id, progress } satisfies WorkerResponse)
}

function outputBuffer(bytes: Uint8Array) {
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  return buffer
}

async function compressImage(id: string, file: ArrayBuffer, format: ImageFormat, quality: number) {
  postProgress(id, 5)
  const image = imagePool.ingestImage(file)
  await image.decoded
  postProgress(id, 35)
  if (format === "jpeg") await image.encode({ mozjpeg: { quality } })
  else if (format === "png") await image.encode({ oxipng: {} })
  else await image.encode({ webp: { quality } })
  postProgress(id, 85)
  const codec = format === "jpeg" ? "mozjpeg" : format === "png" ? "oxipng" : "webp"
  const result = image.encodedWith[codec]
  if (!result) throw new Error("The image codec returned no output.")
  return { buffer: outputBuffer(result.binary), mimeType: format === "jpeg" ? "image/jpeg" : `image/${format}` }
}

async function compressPdf(id: string, file: ArrayBuffer) {
  postProgress(id, 10)
  const pdf = await PDFDocument.load(file, { ignoreEncryption: false })
  postProgress(id, 55)
  // pdf-lib cannot safely rewrite embedded image XObjects without rasterizing their
  // color spaces. Saving with object streams and removing document metadata keeps
  // the PDF lossless while shrinking structure and metadata overhead.
  pdf.setTitle("")
  pdf.setAuthor("")
  pdf.setSubject("")
  pdf.setKeywords([])
  pdf.setCreator("")
  pdf.setProducer("")
  const bytes = await pdf.save({ useObjectStreams: true, addDefaultPage: false, updateFieldAppearances: false })
  postProgress(id, 90)
  return { buffer: outputBuffer(bytes), mimeType: "application/pdf" }
}

async function loadFfmpeg() {
  if (!ffmpegLoadPromise) {
    ffmpegLoadPromise = ffmpeg.load({
      coreURL: new URL("@ffmpeg/core", import.meta.url).href,
      wasmURL: new URL("@ffmpeg/core/wasm", import.meta.url).href,
    })
  }
  await ffmpegLoadPromise
}

async function compressMp4(id: string, file: ArrayBuffer) {
  await loadFfmpeg()
  const inputName = `${id}.mp4`
  const outputName = `${id}-compressed.mp4`
  await ffmpeg.writeFile(inputName, new Uint8Array(file))
  const onProgress = ({ progress }: { progress: number }) => postProgress(id, Math.min(95, Math.max(10, Math.round(progress * 85 + 10))))
  ffmpeg.on("progress", onProgress)
  try {
    await ffmpeg.exec(["-i", inputName, "-c:v", "libx264", "-crf", "28", "-preset", "ultrafast", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", outputName])
  } finally {
    ffmpeg.off("progress", onProgress)
  }
  const output = await ffmpeg.readFile(outputName)
  await ffmpeg.deleteFile(inputName)
  await ffmpeg.deleteFile(outputName)
  if (typeof output === "string") throw new Error("FFmpeg returned text instead of video bytes.")
  return { buffer: outputBuffer(output), mimeType: "video/mp4" }
}

worker.onmessage = async ({ data }: MessageEvent<CompressRequest>) => {
  try {
    const result = data.format === "pdf"
      ? await compressPdf(data.id, data.file)
      : data.format === "mp4"
        ? await compressMp4(data.id, data.file)
        : await compressImage(data.id, data.file, data.format, data.quality)
    postProgress(data.id, 100)
    worker.postMessage({ type: "complete", id: data.id, ...result } satisfies WorkerResponse, { transfer: [result.buffer] })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Compression failed."
    worker.postMessage({ type: "error", id: data.id, message } satisfies WorkerResponse)
  }
}
