import { useDropzone, type FileRejection } from "react-dropzone"
import { LockKeyhole, Plus, Sparkles, UploadCloud } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const acceptedImageTypes = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
}

type ImageDropzoneProps = {
  onFilesSelected: (files: File[], rejectedFiles: FileRejection[]) => void
}

export function ImageDropzone({ onFilesSelected }: ImageDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    noClick: true,
    accept: acceptedImageTypes,
    onDrop: onFilesSelected,
  })

  return (
    <div>
      <div className="mb-8 max-w-xl"><Badge className="mb-4 gap-1.5 bg-sky-400/10 text-sky-300 hover:bg-sky-400/10"><Sparkles />Squoosh-powered</Badge><h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Make images lighter.<br /><span className="text-muted-foreground">Keep them yours.</span></h1><p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">Drop JPEG, PNG, or WebP images below. Compression runs in a background worker and nothing leaves this browser.</p></div>
      <div {...getRootProps()} className={`group relative flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center transition-colors ${isDragActive ? "border-sky-300 bg-sky-400/10" : "border-border/90 bg-card/40 hover:border-sky-300/60 hover:bg-card/70"}`}><input {...getInputProps()} /><div className="mb-5 grid size-16 place-items-center rounded-2xl border border-sky-300/20 bg-sky-300/10 text-sky-300 transition-transform group-hover:-translate-y-1"><UploadCloud className="size-7" /></div><h2 className="font-heading text-xl font-semibold">{isDragActive ? "Release to compress" : "Drop images here"}</h2><p className="mt-2 text-sm text-muted-foreground">JPEG, PNG, and WebP are supported</p><div className="mt-4 flex flex-wrap justify-center gap-2"><Badge variant="outline">.JPG</Badge><Badge variant="outline">.PNG</Badge><Badge variant="outline">.WEBP</Badge></div><Button type="button" variant="outline" className="mt-6 gap-2" onClick={open}><Plus />Browse images</Button><div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3.5 text-emerald-300" />Processed locally in your browser</div></div>
    </div>
  )
}
