import {
  Download,
  FileImage,
  FileText,
  FileVideo,
  ListChecks,
  Trash2,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatBytes, type QueuedFile } from "@/lib/compression";

type CompressionQueueProps = {
  files: QueuedFile[];
  onClear: () => void;
  onRemove: (id: string) => void;
};

export function CompressionQueue({
  files,
  onClear,
  onRemove,
}: CompressionQueueProps) {
  const downloadFile = (file: QueuedFile) => {
    if (!file.outputUrl) return;
    const link = document.createElement("a");
    link.href = file.outputUrl;
    link.download = `squeeezer-${file.name}`;
    link.click();
  };

  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 border-t border-border/70 py-8 duration-300">
      <div aria-live="polite" className="sr-only">
        {files.length} {files.length === 1 ? "file" : "files"} in the queue.
      </div>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ListChecks className="size-4 text-sky-300" />
            Your queue
          </p>
          <h2 className="mt-1 font-heading text-2xl font-semibold">
            Compression results
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">
            {files.length} {files.length === 1 ? "file" : "files"}
          </Badge>
          {files.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={onClear}
            >
              <Trash2 />
              Clear all
            </Button>
          )}
        </div>
      </div>
      <TooltipProvider>
          <ul className="space-y-2">
            {files.map((file) => (
              <li key={file.id}>
                <Card className="min-h-12 border-border/60 bg-card/50 p-0">
                  <CardContent className="flex min-h-12 flex-wrap items-center gap-2 p-2 sm:flex-nowrap">
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-sky-300">
                    {file.format === "pdf" ? (
                      <FileText className="size-5" />
                    ) : file.format === "mp4" ? (
                      <FileVideo className="size-5" />
                    ) : (
                      <FileImage className="size-5" />
                    )}
                  </div>
                  <div className="min-w-40 flex-1 sm:w-56 sm:min-w-0 sm:flex-none">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Original: {formatBytes(file.originalSize)}
                    </p>
                  </div>
                  <div className="w-full min-w-40 flex-1 space-y-1.5 sm:min-w-0">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {file.status === "error"
                          ? file.error
                          : file.status === "complete"
                            ? "Complete"
                            : "Compressing"}
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {file.progress}%
                      </span>
                    </div>
                    <Progress value={file.progress} />
                  </div>
                  <div className="flex min-w-36 items-center gap-2 text-xs">
                    <Badge
                      variant={
                        file.status === "error"
                          ? "destructive"
                          : file.status === "complete"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {file.status === "complete"
                        ? `${file.savings && file.savings > 0 ? "-" : "+"}${Math.abs(file.savings ?? 0)}%`
                        : file.status}
                    </Badge>
                    {file.compressedSize && (
                      <span className="text-muted-foreground">
                        {formatBytes(file.compressedSize)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            type="button"
                            size="icon"
                            className="size-10"
                            variant="ghost"
                            aria-label={`Download ${file.name}`}
                            disabled={!file.outputUrl}
                            onClick={() => downloadFile(file)}
                          />
                        }
                      >
                        <Download />
                      </TooltipTrigger>
                      <TooltipContent>Download file</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            type="button"
                            size="icon"
                            className="size-10"
                            variant="ghost"
                            aria-label={`Remove ${file.name}`}
                            onClick={() => onRemove(file.id)}
                          />
                        }
                      >
                        <X />
                      </TooltipTrigger>
                      <TooltipContent>Remove file</TooltipContent>
                    </Tooltip>
                  </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
      </TooltipProvider>
    </section>
  );
}
