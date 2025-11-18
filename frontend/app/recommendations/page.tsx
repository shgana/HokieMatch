"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

import { RecommendationsTable } from "@/components/RecommendationsTable"
import { Sidebar } from "@/components/Sidebar"
import { TopNav } from "@/components/TopNav"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { apiGet, apiPost } from "@/lib/api"
import type { Course, RecommendationResult } from "@/lib/types"

const DEFAULT_USER =
  process.env.NEXT_PUBLIC_DEFAULT_USER_ID || "00000000-0000-0000-0000-000000000001"

type Row = {
  course: Course
  reason: string
  workload: string
  gpa?: number
  difficulty?: "Easy" | "Medium" | "Hard"
  pathways?: string[]
}

export default function RecommendationsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const { results } = await apiGet<{ results: RecommendationResult[] }>(
          "/api/recommendations/easy-courses",
          { limit: 25 }
        )
        const built: Row[] = []
        for (const rec of results ?? []) {
          try {
            const res = await apiGet<{ course: Course }>(`/api/courses/${encodeURIComponent(rec.course_id)}`)
            built.push({
              course: res.course,
              reason: rec.rationale.join("; "),
              workload: rec.difficulty,
              gpa: rec.avg_gpa,
              difficulty: rec.difficulty,
              pathways: rec.pathway_hits,
            })
          } catch {
            /* ignore missing course */
          }
        }
        if (!mounted) return
        setRows(built)
      } catch (err: any) {
        if (!mounted) return
        setError(err.message ?? "Failed to load recommendations")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const onAdd = async (courseId: string) => {
    try {
      await apiPost("/api/picks/add", { userId: DEFAULT_USER, courseId })
      setWishlist((prev) => (prev.includes(courseId) ? prev : [...prev, courseId]))
    } catch (err: any) {
      setError(err.message ?? "Failed to add pick")
    }
  }

  return (
    <div className="flex min-h-screen gap-6">
      <Sidebar />
      <main className="flex-1 space-y-6 px-4 pb-10 lg:px-6">
        <TopNav
          title="Recommendations"
          subtitle="Sortable table with live backend recommendations."
        />

        <Card className="flex items-center justify-between rounded-2xl border border-border/80 bg-white/90 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#861F41]" />
            <p className="text-sm text-muted-foreground">
              Pulled from /api/recommendations/easy-courses.
            </p>
          </div>
          <Badge variant="secondary">{wishlist.length} in My Picks</Badge>
        </Card>

        {loading ? (
          <p>Loading recommendations...</p>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <RecommendationsTable rows={rows} onAdd={(course) => onAdd(course.id)} />
        )}
      </main>
    </div>
  )
}
