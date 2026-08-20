export type ImageFormat = "jpeg" | "png" | "webp" | "svg";
export type FileFormat = ImageFormat | "pdf" | "mp4";
export type SvgCompressionOptions = {
  preserveMetadata: boolean;
  aggressive: boolean;
};
export type QueueStatus = "processing" | "complete" | "error";

export type QueuedFile = {
  id: string;
  name: string;
  format: FileFormat;
  originalSize: number;
  progress: number;
  compressedSize?: number;
  savings?: number;
  outputUrl?: string;
  status: QueueStatus;
  error?: string;
};

export type WorkerResponse =
  | { type: "progress"; id: string; progress: number }
  | { type: "complete"; id: string; buffer: ArrayBuffer; mimeType: string }
  | { type: "error"; id: string; message: string };

export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** unitIndex).toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function imageFormat(file: File): ImageFormat {
  if (file.type === "image/svg+xml" || /\.svg$/i.test(file.name)) return "svg";
  if (file.type === "image/png" || /\.png$/i.test(file.name)) return "png";
  if (file.type === "image/webp" || /\.webp$/i.test(file.name)) return "webp";
  return "jpeg";
}

export function fileFormat(file: File): FileFormat {
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name))
    return "pdf";
  if (file.type === "video/mp4" || /\.mp4$/i.test(file.name)) return "mp4";
  return imageFormat(file);
}
