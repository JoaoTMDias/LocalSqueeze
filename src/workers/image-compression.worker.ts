import { FFmpeg } from "@ffmpeg/ffmpeg"
import { encode as encodeJpeg } from "@jsquash/jpeg"
import { optimise as optimisePng } from "@jsquash/oxipng"
import { encode as encodeWebp } from "@jsquash/webp"
import { PDFDocument } from "pdf-lib"
import type { PluginConfig } from "svgo/browser"

import type { FileFormat, ImageFormat, SvgCompressionOptions, WorkerResponse } from "@/lib/compression"


type CompressRequest = {
  id: string
  file: ArrayBuffer
  format: FileFormat
  quality: number
  scale: number
  svgOptions: SvgCompressionOptions
}

type WorkerScope = {
  onmessage: ((event: MessageEvent<CompressRequest>) => void) | null
  postMessage: (message: unknown, options?: StructuredSerializeOptions) => void
}
const worker = self as unknown as WorkerScope
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

async function decodeImage(file: ArrayBuffer, mimeType: string) {
  const bitmap = await createImageBitmap(new Blob([file], { type: mimeType }))
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const context = canvas.getContext("2d")
  if (!context) {
    bitmap.close()
    throw new Error("Unable to create an OffscreenCanvas context.")
  }
  context.drawImage(bitmap, 0, 0)
  bitmap.close()
  return context.getImageData(0, 0, canvas.width, canvas.height)
}

async function compressImage(id: string, file: ArrayBuffer, format: ImageFormat, quality: number, scale: number) {
  postProgress(id, 5)
  const mimeType = format === "jpeg" ? "image/jpeg" : `image/${format}`
  const decoded = await decodeImage(file, mimeType)
  postProgress(id, 35)
  let imageData = decoded
  if (scale < 100) {
    const width = Math.max(1, Math.round(decoded.width * scale / 100))
    const height = Math.max(1, Math.round(decoded.height * scale / 100))
    const canvas = new OffscreenCanvas(width, height)
    const context = canvas.getContext("2d")
    if (!context) throw new Error("Unable to create a resize canvas context.")
    context.drawImage(await createImageBitmap(new ImageData(decoded.data, decoded.width, decoded.height)), 0, 0, width, height)
    imageData = context.getImageData(0, 0, width, height)
  }
  if (format === "jpeg") return { buffer: outputBuffer(new Uint8Array(await encodeJpeg(imageData, { quality }))), mimeType }
  if (format === "png") return { buffer: outputBuffer(new Uint8Array(await optimisePng(imageData))), mimeType }
  const buffer = await encodeWebp(imageData, { quality })
  postProgress(id, 85)
  return { buffer: outputBuffer(new Uint8Array(buffer)), mimeType }
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

function validateSvg(svg: string) {
  if (!/<svg(?:\s|>)/i.test(svg)) throw new Error("The file does not contain a valid SVG root.")
  if (/<(?:script|foreignObject|iframe|object|embed)\b/i.test(svg) || /\bon[a-z]+\s*=/i.test(svg) || /(?:javascript|vbscript):/i.test(svg) || /<!doctype/i.test(svg)) {
    throw new Error("This SVG contains unsupported or potentially unsafe content.")
  }
}

async function compressSvg(id: string, file: ArrayBuffer, options: SvgCompressionOptions) {
  postProgress(id, 10)
  const source = new TextDecoder("utf-8", { fatal: true }).decode(file)
  validateSvg(source)
  postProgress(id, 25)
  const { builtinPlugins, optimize } = await import("svgo/browser")
  const presetDefault = builtinPlugins.find((plugin) => plugin.name === "preset-default")
  if (!presetDefault) throw new Error("SVG optimizer preset is unavailable.")
  const presetConfig: PluginConfig = {
    name: "preset-default",
    fn: presetDefault.fn,
    params: {
      overrides: {
        cleanupIds: options.aggressive,
        removeMetadata: options.preserveMetadata ? false : undefined,
        removeDesc: options.preserveMetadata ? false : undefined,
      },
    },
  }
  const result = optimize(source, {
    plugins: [presetConfig, ...(options.preserveMetadata ? [] : ["removeTitle" as const])],
  })
  postProgress(id, 80)
  validateSvg(result.data)
  const optimized = new TextEncoder().encode(result.data)
  const input = new Uint8Array(file)
  postProgress(id, 95)
  return { buffer: outputBuffer(optimized.byteLength < input.byteLength ? optimized : input), mimeType: "image/svg+xml" }
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

async function compressMp4(id: string, file: ArrayBuffer, scale: number) {
  await loadFfmpeg()
  const inputName = `${id}.mp4`
  const outputName = `${id}-compressed.mp4`
  await ffmpeg.writeFile(inputName, new Uint8Array(file))
  const onProgress = ({ progress }: { progress: number }) => postProgress(id, Math.min(95, Math.max(10, Math.round(progress * 85 + 10))))
  ffmpeg.on("progress", onProgress)
  try {
    const scaleFilter = scale < 100 ? ["-vf", `scale=trunc(iw*${scale / 100}/2)*2:trunc(ih*${scale / 100}/2)*2`] : []
    await ffmpeg.exec(["-i", inputName, ...scaleFilter, "-c:v", "libx264", "-crf", "28", "-preset", "ultrafast", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", outputName])
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
    const result = data.format === "svg"
      ? await compressSvg(data.id, data.file, data.svgOptions)
      : data.format === "pdf"
      ? await compressPdf(data.id, data.file)
      : data.format === "mp4"
        ? await compressMp4(data.id, data.file, data.scale)
        : await compressImage(data.id, data.file, data.format, data.quality, data.scale)
    postProgress(data.id, 100)
    worker.postMessage({ type: "complete", id: data.id, ...result } satisfies WorkerResponse, { transfer: [result.buffer] })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Compression failed."
    worker.postMessage({ type: "error", id: data.id, message } satisfies WorkerResponse)
  }
}
