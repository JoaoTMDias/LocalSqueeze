import { useEffect, useRef, useState } from "react";
import type { FileRejection } from "react-dropzone";
import { SkipLinks } from "@jtmdias/react-a11y-tools";
import { Zap } from "lucide-react";
import { registerSW } from "virtual:pwa-register";
import { toast, Toaster } from "sonner";

import { AppHeader } from "@/components/app-header";
import { CompressionQueue } from "@/components/compression-queue";
import { ImageDropzone } from "@/components/image-dropzone";
import {
  fileFormat,
  type QueuedFile,
  type SvgCompressionOptions,
  type WorkerResponse,
} from "@/lib/compression";

function App() {
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [quality, setQuality] = useState(80);
  const [scale, setScale] = useState(100);
  const [svgOptions, setSvgOptions] = useState<SvgCompressionOptions>({
    preserveMetadata: true,
    aggressive: false,
  });
  const [announcement, setAnnouncement] = useState("Ready to add files.");
  const workerRef = useRef<Worker | null>(null);
  const updateServiceWorkerRef = useRef<
    ((reloadPage?: boolean) => Promise<void>) | null
  >(null);
  // Blob URLs are browser resources and must be revoked when rows leave the queue.
  const objectUrlsRef = useRef(new Map<string, string>());

  const createWorker = () => {
    const worker = new Worker(
      new URL("./workers/image-compression.worker.ts", import.meta.url),
      { type: "module" },
    );
    workerRef.current = worker;
    worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
      if (data.type === "progress") {
        setFiles((current) =>
          current.map((file) =>
            file.id === data.id ? { ...file, progress: data.progress } : file,
          ),
        );
        if (
          data.progress === 10 ||
          data.progress % 25 === 0 ||
          data.progress === 100
        )
          setAnnouncement(`Compression progress: ${data.progress}%.`);
        return;
      }
      if (data.type === "error") {
        setFiles((current) =>
          current.map((file) =>
            file.id === data.id
              ? { ...file, status: "error", error: data.message }
              : file,
          ),
        );
        setAnnouncement("A file failed to compress.");
        return;
      }
      const outputUrl = URL.createObjectURL(
        new Blob([data.buffer], { type: data.mimeType }),
      );
      objectUrlsRef.current.set(data.id, outputUrl);
      setFiles((current) =>
        current.map((file) => {
          if (file.id !== data.id) return file;
          const compressedSize = data.buffer.byteLength;
          return {
            ...file,
            progress: 100,
            status: "complete",
            compressedSize,
            savings: Math.round((1 - compressedSize / file.originalSize) * 100),
            outputUrl,
          };
        }),
      );
      setAnnouncement("Compression complete and ready to download.");
    };
    worker.onerror = () =>
      setAnnouncement("The image worker encountered an error.");
    return worker;
  };

  useEffect(
    () => () => {
      workerRef.current?.terminate();
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    },
    [],
  );

  useEffect(() => {
    updateServiceWorkerRef.current = registerSW({
      immediate: true,
      onNeedRefresh() {
        toast("Nova versão disponível", {
          id: "app-update",
          description: "Atualize para carregar as alterações mais recentes.",
          duration: Infinity,
          action: {
            label: "Atualizar",
            onClick: () => void updateServiceWorkerRef.current?.(true),
          },
        });
      },
    });
    return () => {
      updateServiceWorkerRef.current = null;
    };
  }, []);

  const processFile = (file: File) => {
    const worker = workerRef.current ?? createWorker();
    const id = `${file.name}-${file.lastModified}-${file.size}-${crypto.randomUUID()}`;
    const format = fileFormat(file);
    setFiles((current) => [
      ...current,
      {
        id,
        name: file.name,
        format,
        originalSize: file.size,
        progress: 0,
        status: "processing",
      },
    ]);
    setAnnouncement(`${file.name} added and processing started.`);
    file
      .arrayBuffer()
      .then((buffer) =>
        worker.postMessage(
          { id, file: buffer, format, quality, scale, svgOptions },
          [buffer],
        ),
      )
      .catch(() => {
        setFiles((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, status: "error", error: "Could not read this file." }
              : item,
          ),
        );
      });
  };

  const handleDrop = (
    acceptedFiles: File[],
    rejectedFiles: FileRejection[],
  ) => {
    if (rejectedFiles.length > 0)
      setAnnouncement(
        `${rejectedFiles.length} unsupported file${rejectedFiles.length === 1 ? "" : "s"} rejected. Add JPEG, PNG, SVG, WebP, PDF, or MP4 files.`,
      );
    acceptedFiles.forEach(processFile);
  };

  const removeFile = (id: string) => {
    const objectUrl = objectUrlsRef.current.get(id);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrlsRef.current.delete(id);
    }
    setFiles((current) => current.filter((file) => file.id !== id));
    setAnnouncement("File removed from the queue.");
  };

  const clearFiles = () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
    setFiles([]);
    setAnnouncement("Queue cleared.");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <SkipLinks
        items={[
          { target: "#main-content", text: "Skip to main content" },
          {
            target: "#compression-controls",
            text: "Skip to compression controls",
          },
        ]}
      />
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        <AppHeader
          quality={quality}
          scale={scale}
          svgOptions={svgOptions}
          onQualityChange={setQuality}
          onScaleChange={setScale}
          onSvgOptionsChange={setSvgOptions}
        />
        <div aria-live="polite" className="sr-only">
          {announcement}
        </div>
        <section
          id="main-content"
          tabIndex={-1}
          className="py-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring lg:py-8"
        >
          <ImageDropzone onFilesSelected={handleDrop} />
          {files.length > 0 && (
            <CompressionQueue
              files={files}
              onClear={clearFiles}
              onRemove={removeFile}
            />
          )}
        </section>
        <footer className="flex flex-col gap-3 border-t border-border/70 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2">
            <Zap className="size-3.5 text-amber-300" />
            No uploads. No accounts. No compromises.
          </span>
          <a
            className="text-foreground underline decoration-border underline-offset-2 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href="https://github.com/JoaoTMDias/LocalSqueeze"
            target="_blank"
            rel="noopener noreferrer"
          >
            Free, Open and Local by design
          </a>
        </footer>
      </div>
      <Toaster />
    </main>
  );
}

export default App;
