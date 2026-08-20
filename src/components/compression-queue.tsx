import { Download, FileImage, Gauge, ListChecks, Trash2, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatBytes, type QueuedFile } from "@/lib/compression"

type CompressionQueueProps = {
  files: QueuedFile[]
  onClear: () => void
  onRemove: (id: string) => void
}

export function CompressionQueue({ files, onClear, onRemove }: CompressionQueueProps) {
  const downloadFile = (file: QueuedFile) => {
    if (!file.outputUrl) return
    const link = document.createElement("a")
    link.href = file.outputUrl
    link.download = `localsqueeze-${file.name}`
    link.click()
  }

  return (
    <section className="border-t border-border/70 py-8"><div aria-live="polite" className="sr-only">{files.length} {files.length === 1 ? "image" : "images"} in the queue.</div><div className="mb-5 flex items-end justify-between gap-4"><div><p className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><ListChecks className="size-4 text-sky-300" />Your queue</p><h2 className="mt-1 font-heading text-2xl font-semibold">Compression results</h2></div><div className="flex items-center gap-3"><Badge variant="outline">{files.length} {files.length === 1 ? "image" : "images"}</Badge>{files.length > 0 && <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={onClear}><Trash2 />Clear all</Button>}</div></div>{files.length === 0 ? <div className="rounded-2xl border border-border/60 bg-card/30 px-6 py-12 text-center"><Gauge className="mx-auto size-8 text-muted-foreground/60" /><p className="mt-3 text-sm text-muted-foreground">Your compressed images will appear here.</p></div> : <div className="space-y-3">{files.map((file) => <Card key={file.id} className="border-border/60 bg-card/50"><CardContent className="flex flex-wrap items-center gap-4 p-4"><div className="grid size-11 shrink-0 place-items-center rounded-lg bg-muted text-sky-300"><FileImage className="size-5" /></div><div className="min-w-40 flex-1"><p className="truncate text-sm font-medium">{file.name}</p><p className="text-xs text-muted-foreground">Original: {formatBytes(file.originalSize)}</p></div><div className="w-full min-w-40 flex-1 space-y-1.5 sm:w-36"><div className="flex justify-between text-xs"><span className="text-muted-foreground">{file.status === "error" ? file.error : file.status === "complete" ? "Complete" : "Compressing"}</span><span className="tabular-nums text-muted-foreground">{file.progress}%</span></div><Progress value={file.progress} /></div><div className="flex min-w-36 items-center gap-2 text-xs"><Badge variant={file.status === "error" ? "destructive" : file.status === "complete" ? "secondary" : "outline"}>{file.status === "complete" ? `${file.savings && file.savings > 0 ? "-" : "+"}${Math.abs(file.savings ?? 0)}%` : file.status}</Badge>{file.compressedSize && <span className="text-muted-foreground">{formatBytes(file.compressedSize)}</span>}</div><div className="flex items-center gap-1"><Button type="button" size="icon-sm" variant="ghost" aria-label={`Download ${file.name}`} disabled={!file.outputUrl} onClick={() => downloadFile(file)}><Download /></Button><Button type="button" size="icon-sm" variant="ghost" aria-label={`Remove ${file.name}`} onClick={() => onRemove(file.id)}><X /></Button></div></CardContent></Card>)}</div>}</section>
  )
}
