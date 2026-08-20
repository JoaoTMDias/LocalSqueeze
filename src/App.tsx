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
import { formatLocalizedNumber, useLocale } from "@/lib/i18n";

function App() {
  const { locale, setLocale, t } = useLocale();
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [quality, setQuality] = useState(80);
  const [scale, setScale] = useState(100);
  const [svgOptions, setSvgOptions] = useState<SvgCompressionOptions>({
    preserveMetadata: true,
    aggressive: false,
  });
  const [announcement, setAnnouncement] = useState(() => t("ready"));
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
          setAnnouncement(
            t("compressionProgress", {
              progress: formatLocalizedNumber(data.progress, locale),
            }),
          );
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
        setAnnouncement(t("compressionFailed"));
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
      setAnnouncement(t("compressionComplete"));
    };
    worker.onerror = () => setAnnouncement(t("workerError"));
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
        toast(t("updateAvailable"), {
          id: "app-update",
          description: t("updateDescription"),
          duration: Infinity,
          action: {
            label: t("update"),
            onClick: () => void updateServiceWorkerRef.current?.(true),
          },
        });
      },
    });
    return () => {
      updateServiceWorkerRef.current = null;
    };
  }, [locale, t]);

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
    setAnnouncement(t("fileAdded", { name: file.name }));
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
              ? { ...item, status: "error", error: t("fileReadError") }
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
      setAnnouncement(t("unsupportedFiles", { count: rejectedFiles.length }));
    acceptedFiles.forEach(processFile);
  };

  const removeFile = (id: string) => {
    const objectUrl = objectUrlsRef.current.get(id);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrlsRef.current.delete(id);
    }
    setFiles((current) => current.filter((file) => file.id !== id));
    setAnnouncement(t("fileRemoved"));
  };

  const clearFiles = () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
    setFiles([]);
    setAnnouncement(t("queueCleared"));
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <SkipLinks
        items={[
          { target: "#main-content", text: t("skipMain") },
          {
            target: "#compression-controls",
            text: t("skipControls"),
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
            {t("footerPrivacy")}
          </span>
          <a
            className="text-foreground underline decoration-border underline-offset-2 motion-safe:transition-colors motion-reduce:transition-none hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href="https://github.com/JoaoTMDias/LocalSqueeze"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("footerOpen")}
          </a>
          <span className="text-muted-foreground">
            Squeeezer v{__APP_VERSION__}
          </span>
          <label
            className="flex items-center gap-2 text-foreground"
            htmlFor="language-select"
          >
            {t("language")}
            <select
              id="language-select"
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={locale}
              onChange={(event) =>
                setLocale(event.target.value as typeof locale)
              }
            >
              <option value="en">{t("languageEnglish")}</option>
              <option value="pt-PT">{t("languagePortuguese")}</option>
            </select>
          </label>
        </footer>
      </div>
      <Toaster />
    </main>
  );
}

export default App;
