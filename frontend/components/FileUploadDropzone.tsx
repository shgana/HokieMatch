"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Check, CloudUpload, FileText, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface FileUploadDropzoneProps {
  onFileSelected?: (file: File | null) => void
}

export function FileUploadDropzone({ onFileSelected }: FileUploadDropzoneProps) {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [parsed, setParsed] = useState(false)

  const onDrop = useCallback(
    (accepted: File[]) => {
      const nextFile = accepted?.[0]
      if (!nextFile) return
      setFile(nextFile)
      setParsed(false)
      setProgress(10)
      onFileSelected?.(nextFile)
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setParsed(true)
            return 100
          }
          return prev + 15
        })
      }, 300)
    },
    [onFileSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  })

  const clear = () => {
    setFile(null)
    setProgress(0)
    setParsed(false)
    onFileSelected?.(null)
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-dashed border-[#861F41]/30 bg-white/80 p-6 shadow-sm">
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-8 text-center transition ${
          isDragActive
            ? "border-[#861F41] bg-[#861F41]/5"
            : "border-border bg-muted/40 hover:border-[#861F41]/80"
        }`}
      >
        <input {...getInputProps()} />
        <CloudUpload className="h-10 w-10 text-[#861F41]" />
        <div>
          <p className="text-base font-semibold text-foreground">Drag & drop your DARS PDF</p>
          <p className="text-sm text-muted-foreground">or click to browse and upload</p>
        </div>
        <Badge variant="outline" className="border-dashed">
          Supported: .pdf — mock parsing only
        </Badge>
      </div>

      {file && (
        <div className="mt-6 space-y-3 rounded-xl border border-border/70 bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-inner">
                {parsed ? <Check className="h-5 w-5 text-emerald-500" /> : <FileText className="h-5 w-5 text-[#861F41]" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={clear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground">
            {parsed ? "Parsing complete — summary ready." : "Mock parsing in progress..."}
          </p>
        </div>
      )}
    </Card>
  )
}
