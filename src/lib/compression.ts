export type ImageFormat = "jpeg" | "png" | "webp"
export type QueueStatus = "processing" | "complete" | "error"

export type QueuedFile = {
  id: string
  name: string
  originalSize: number
  progress: number
  compressedSize?: number
  savings?: number
  outputUrl?: string
  status: QueueStatus
  error?: string
}

export type WorkerResponse =
  | { type: "progress"; id: string; progress: number }
  | { type: "complete"; id: string; buffer: ArrayBuffer; mimeType: string }
  | { type: "error"; id: string; message: string }

export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** unitIndex).toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

export function imageFormat(file: File): ImageFormat {
  if (file.type === "image/png" || /\.png$/i.test(file.name)) return "png"
  if (file.type === "image/webp" || /\.webp$/i.test(file.name)) return "webp"
  return "jpeg"
}
