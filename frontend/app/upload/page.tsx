"use client"

import { useState } from "react"
import { BarChart3, FileText, GripHorizontal, Loader2 } from "lucide-react"

import { FileUploadDropzone } from "@/components/FileUploadDropzone"
import { Sidebar } from "@/components/Sidebar"
import { TopNav } from "@/components/TopNav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiPost } from "@/lib/api"
import type { DarsReport } from "@/lib/types"

const DEFAULT_USER =
  process.env.NEXT_PUBLIC_DEFAULT_USER_ID || "00000000-0000-0000-0000-000000000001"

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<DarsReport | null>(null)

  const handleParse = async () => {
    if (!selectedFile) return
    setUploading(true)
    setError(null)
    try {
      const rawText = await selectedFile.text()
      const res = await apiPost<{ report: DarsReport }>("/api/dars/upload", {
        userId: DEFAULT_USER,
        filename: selectedFile.name,
        raw: rawText || selectedFile.name,
      })
      setReport(res.report)
    } catch (err: any) {
      setError(err.message ?? "Failed to upload DARS")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex min-h-screen gap-6">
      <Sidebar />
      <main className="flex-1 space-y-6 px-4 pb-10 lg:px-6">
        <TopNav title="Upload DARS" subtitle="Uploads to backend /api/dars/upload and stores parsed data." />

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <FileUploadDropzone onFileSelected={setSelectedFile} />
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-muted/60 px-4 py-3">
              <GripHorizontal className="h-4 w-4 text-[#861F41]" />
              <p className="text-sm text-muted-foreground">
                Files are sent to the Express backend for parsing (placeholder parser for now).
              </p>
            </div>
            <Button
              disabled={!selectedFile || uploading}
              onClick={handleParse}
              className="gap-2 bg-[#861F41] text-white hover:bg-[#6f1935]"
            >
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
              Upload & parse
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <Card className="rounded-2xl border border-border/80 bg-white/90 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Parsed summary</CardTitle>
                <p className="text-sm text-muted-foreground">Data returned from the backend.</p>
              </div>
              <Badge variant="secondary">{report ? "Live" : "Waiting"}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-[#861F41]" />
                  <span>{selectedFile?.name ?? report?.filename ?? "No file uploaded"}</span>
                </div>
                {report?.hours_completed !== undefined && (
                  <Badge variant="outline">{report.hours_completed} hrs</Badge>
                )}
              </div>

              {report ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border/70 bg-white/80 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Completed hours</p>
                      <p className="text-xl font-bold text-foreground">{report.hours_completed}</p>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-white/80 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Remaining hours</p>
                      <p className="text-xl font-bold text-foreground">{report.hours_remaining}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Requirements detected</p>
                    <div className="space-y-2 rounded-xl border border-dashed border-[#861F41]/30 bg-muted/50 p-3 text-sm text-muted-foreground">
                      {(report.parsed?.requirementGroups ?? []).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-[#E87722]" />
                          {item.name} — {item.status}
                        </div>
                      ))}
                      {report.parsed?.requirementGroups?.length === 0 && (
                        <p className="text-muted-foreground">No requirement groups parsed.</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Upload a DARS file to see parsed output.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
