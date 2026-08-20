import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { Check, FileImage, FileVideo, FileText, Gauge, ListChecks, LockKeyhole, Plus, Settings2, Sparkles, Trash2, UploadCloud, X, Zap } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type QueuedFile = { id: string; name: string; size: string; type: "image" | "pdf" | "video" }

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** unitIndex).toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function fileType(name: string): QueuedFile["type"] {
  if (/\.(mp4|mov|webm|mkv)$/i.test(name)) return "video"
  if (/\.pdf$/i.test(name)) return "pdf"
  return "image"
}

function App() {
  const [files, setFiles] = useState<QueuedFile[]>([])
  const [quality, setQuality] = useState([72])
  const [announcement, setAnnouncement] = useState("Ready to add files.")
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    noClick: true,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "application/pdf": [".pdf"],
      "video/mp4": [".mp4"],
      "video/webm": [".webm"],
    },
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) setAnnouncement(`${rejectedFiles.length} unsupported file${rejectedFiles.length === 1 ? "" : "s"} rejected.`)
      if (acceptedFiles.length === 0) return
      setFiles((current) => [...current, ...acceptedFiles.map((file) => ({ id: `${file.name}-${file.lastModified}-${file.size}`, name: file.name, size: formatBytes(file.size), type: fileType(file.name) }))])
      setAnnouncement(`${acceptedFiles.length} file${acceptedFiles.length === 1 ? "" : "s"} added to the queue.`)
    },
  })

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-border/70 pb-6">
            <div className="flex items-center gap-3"><svg viewBox="0 0 512 512" className="size-10 shrink-0" role="img" aria-label="LocalSqueeze logo"><defs><linearGradient id="outerGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" /><stop offset="100%" stopColor="#818CF8" stopOpacity="0.1" /></linearGradient><linearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#38BDF8" /><stop offset="100%" stopColor="#6366F1" /></linearGradient></defs><rect width="512" height="512" rx="112" fill="#0F172A" /><g stroke="url(#outerGrad)" strokeWidth="4" fill="none" strokeLinejoin="round" strokeDasharray="8 8"><polygon points="256,72 384,136 256,200 128,136" /><polygon points="128,136 256,200 256,328 128,264" /><polygon points="256,200 384,136 384,264 256,328" /></g><g stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" opacity="0.8"><line x1="200" y1="112" x2="232" y2="128" /><line x1="312" y1="112" x2="280" y2="128" /><line x1="168" y1="216" x2="192" y2="228" /><line x1="344" y1="216" x2="320" y2="228" /></g><g fill="url(#innerGrad)" stroke="#0F172A" strokeWidth="3" strokeLinejoin="round"><polygon points="256,176 320,208 256,240 192,208" opacity="0.95" /><polygon points="192,208 256,240 256,304 192,272" opacity="0.8" /><polygon points="256,240 320,208 320,272 256,304" /></g><circle cx="256" cy="240" r="4" fill="#F8FAFC" /></svg><div><p className="font-heading text-lg font-semibold tracking-tight">LocalSqueeze</p><p className="text-xs text-muted-foreground">Private file optimization</p></div></div>
          <Badge variant="outline" className="gap-1.5 border-emerald-400/30 bg-emerald-400/10 text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-400" />Client-side only</Badge>
        </header>

        <section className="grid gap-8 py-10 lg:grid-cols-[1.15fr_.85fr] lg:items-start lg:py-14">
          <div><div className="mb-8 max-w-xl"><Badge className="mb-4 gap-1.5 bg-sky-400/10 text-sky-300 hover:bg-sky-400/10"><Sparkles />Ready when you are</Badge><h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Make files lighter.<br /><span className="text-muted-foreground">Keep them yours.</span></h1><p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">Drop your files below to prepare a private compression queue. Nothing leaves this browser.</p></div>
            <div {...getRootProps()} className={`group relative flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center transition-colors ${isDragActive ? "border-sky-300 bg-sky-400/10" : "border-border/90 bg-card/40 hover:border-sky-300/60 hover:bg-card/70"}`}><input {...getInputProps()} /><div className="mb-5 grid size-16 place-items-center rounded-2xl border border-sky-300/20 bg-sky-300/10 text-sky-300 transition-transform group-hover:-translate-y-1"><UploadCloud className="size-7" /></div><h2 className="font-heading text-xl font-semibold">{isDragActive ? "Release to add files" : "Drop files here"}</h2><p className="mt-2 text-sm text-muted-foreground">Images, PDFs, and video are welcome</p><div className="mt-4 flex flex-wrap justify-center gap-2"><Badge variant="outline">.JPG</Badge><Badge variant="outline">.PNG</Badge><Badge variant="outline">.WEBP</Badge><Badge variant="outline">.PDF</Badge><Badge variant="outline">.MP4</Badge></div><Button type="button" variant="outline" className="mt-6 gap-2" onClick={open}><Plus />Browse files</Button><div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3.5 text-emerald-300" />Processed locally in your browser</div></div>
          </div>

          <Card className="border-border/70 bg-card/70 shadow-2xl shadow-black/10"><CardHeader className="border-b border-border/60"><div className="flex items-center justify-between"><div><CardTitle className="flex items-center gap-2"><Settings2 className="size-4 text-sky-300" />Compression controls</CardTitle><CardDescription className="mt-1">Defaults are ready for a balanced result.</CardDescription></div><Badge variant="secondary">Preview</Badge></div></CardHeader><CardContent className="space-y-6 pt-6"><Tabs defaultValue="balanced"><TabsList className="w-full"><TabsTrigger value="small">Smallest</TabsTrigger><TabsTrigger value="balanced">Balanced</TabsTrigger><TabsTrigger value="quality">Quality</TabsTrigger></TabsList><TabsContent value="small" className="pt-4 text-sm text-muted-foreground">Prioritize a smaller output size.</TabsContent><TabsContent value="balanced" className="pt-4 text-sm text-muted-foreground">A practical balance for everyday sharing.</TabsContent><TabsContent value="quality" className="pt-4 text-sm text-muted-foreground">Preserve more detail in the output.</TabsContent></Tabs><div className="space-y-3"><div className="flex justify-between text-sm"><span className="font-medium">Quality</span><span className="text-muted-foreground">{quality[0]}%</span></div><Slider value={quality} onValueChange={(value) => setQuality(value as number[])} aria-label="Compression quality" /></div><Accordion defaultValue={[]}><AccordionItem value="advanced"><AccordionTrigger>Advanced settings</AccordionTrigger><AccordionContent><p className="text-muted-foreground">Fine-grained format and metadata controls will appear here.</p></AccordionContent></AccordionItem></Accordion></CardContent></Card>
        </section>

        <section className="border-t border-border/70 py-8"><div aria-live="polite" className="sr-only">{announcement}</div><div className="mb-5 flex items-end justify-between gap-4"><div><p className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><ListChecks className="size-4 text-sky-300" />Your queue</p><h2 className="mt-1 font-heading text-2xl font-semibold">Ready to squeeze</h2></div><div className="flex items-center gap-3"><Badge variant="outline">{files.length} {files.length === 1 ? "file" : "files"}</Badge>{files.length > 0 && <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={() => { setFiles([]); setAnnouncement("Queue cleared.") }}><Trash2 />Clear all</Button>}</div></div>{files.length === 0 ? <div className="rounded-2xl border border-border/60 bg-card/30 px-6 py-12 text-center"><Gauge className="mx-auto size-8 text-muted-foreground/60" /><p className="mt-3 text-sm text-muted-foreground">Your selected files will appear here.</p></div> : <div className="space-y-3">{files.map((file) => <div key={file.id} className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/50 px-4 py-3"><div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-sky-300">{file.type === "video" ? <FileVideo className="size-5" /> : file.type === "pdf" ? <FileText className="size-5" /> : <FileImage className="size-5" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{file.name}</p><p className="text-xs text-muted-foreground">{file.size} · Waiting</p></div><Progress value={0} className="hidden w-28 sm:flex" /><Button size="icon-sm" variant="ghost" aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((item) => item.id !== file.id))}><X /></Button></div>)}</div>}</section>
        <footer className="flex flex-col gap-3 border-t border-border/70 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span className="flex items-center gap-2"><Zap className="size-3.5 text-amber-300" />No uploads. No accounts. No compromises.</span><span className="flex items-center gap-1.5"><Check className="size-3.5 text-emerald-300" />Local by design</span></footer>
      </div>
    </main>
  )
}

export default App
