import { useDropzone, type FileRejection } from "react-dropzone"
import { LockKeyhole, Plus, UploadCloud } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const acceptedFileTypes = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
  "video/mp4": [".mp4"],
}

type ImageDropzoneProps = {
  onFilesSelected: (files: File[], rejectedFiles: FileRejection[]) => void
}

export function ImageDropzone({ onFilesSelected }: ImageDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    noClick: true,
    accept: acceptedFileTypes,
    onDrop: onFilesSelected,
  })

  return (
    <div>
      <div {...getRootProps()} className={`group relative flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center transition-colors ${isDragActive ? "border-sky-300 bg-sky-400/10" : "border-border/90 bg-card/40 hover:border-sky-300/60 hover:bg-card/70"}`}><input {...getInputProps({ "aria-label": "File picker" })} /><div className="mb-5 grid size-16 place-items-center rounded-2xl border border-sky-300/20 bg-sky-300/10 text-sky-300 transition-transform group-hover:-translate-y-1"><UploadCloud className="size-7" /></div><h2 className="font-heading text-xl font-semibold">{isDragActive ? "Release to compress" : "Drop files here"}</h2><p className="mt-2 text-sm text-muted-foreground">Images, PDFs, and MP4 video are supported</p><div className="mt-4 flex flex-wrap justify-center gap-2"><Badge variant="outline">.JPG</Badge><Badge variant="outline">.PNG</Badge><Badge variant="outline">.WEBP</Badge><Badge variant="outline">.PDF</Badge><Badge variant="outline">.MP4</Badge></div><Button type="button" variant="outline" className="mt-6 gap-2" onClick={open}><Plus />Browse files</Button><div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3.5 text-emerald-300" />Processed locally in your browser</div></div>
    </div>
  )
}
