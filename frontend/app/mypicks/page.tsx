"use client"

import { useEffect, useMemo, useState } from "react"
import { Move, Rows, Save } from "lucide-react"

import { CourseCard } from "@/components/CourseCard"
import { Sidebar } from "@/components/Sidebar"
import { TopNav } from "@/components/TopNav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { apiGet } from "@/lib/api"
import type { Course, UserPick } from "@/lib/types"

const DEFAULT_USER =
  process.env.NEXT_PUBLIC_DEFAULT_USER_ID || "00000000-0000-0000-0000-000000000001"

type PickItem = UserPick & { selected?: boolean }

export default function MyPicksPage() {
  const [list, setList] = useState<PickItem[]>([])
  const [courses, setCourses] = useState<Record<string, Course>>({})
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const picksRes = await apiGet<{ picks: UserPick[] }>("/api/picks", { userId: DEFAULT_USER })
        const picks = picksRes.picks ?? []

        const courseMap: Record<string, Course> = {}
        for (const p of picks) {
          try {
            const res = await apiGet<{ course: Course }>(`/api/courses/${encodeURIComponent(p.course_id)}`)
            courseMap[p.course_id] = res.course
          } catch {
            /* ignore missing course */
          }
        }

        if (!mounted) return
        setList(picks)
        setCourses(courseMap)
      } catch (err: any) {
        if (!mounted) return
        setError(err.message ?? "Failed to load picks")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const reorder = (fromId: string, toId: string) => {
    const fromIndex = list.findIndex((item) => item.id === fromId)
    const toIndex = list.findIndex((item) => item.id === toId)
    if (fromIndex === -1 || toIndex === -1) return
    const updated = [...list]
    const [moved] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, moved)
    setList(updated)
  }

  const toggleSelect = (id: string) => {
    setList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    )
  }

  const exportCsv = () => {
    const rows = list.map((p) => [p.course_id, courses[p.course_id]?.title ?? "", p.note ?? ""].join(","))
    console.info("CSV export (client-side only):\ncourse_id,title,note\n" + rows.join("\n"))
  }

  const selected = useMemo(() => list.filter((item) => item.selected), [list])

  return (
    <div className="flex min-h-screen gap-6">
      <Sidebar />
      <main className="flex-1 space-y-6 px-4 pb-10 lg:px-6">
        <TopNav
          title="My Picks"
          subtitle="Drag-and-drop reorder, select for comparison, backed by Supabase."
        />

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/80 bg-white/90 px-4 py-3 shadow-sm">
          <Badge variant="secondary">{list.length} saved</Badge>
          <Badge variant="outline" className="border-dashed">
            {selected.length} selected for compare
          </Badge>
          <Button size="sm" variant="outline" className="gap-2" onClick={exportCsv}>
            <Save className="h-4 w-4" />
            Export to CSV
          </Button>
          <Button size="sm" className="gap-2 bg-[#861F41] text-white hover:bg-[#6f1935]">
            Compare Selected
          </Button>
        </div>

        {loading ? (
          <p>Loading picks...</p>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {list.map((item) => {
              const course = courses[item.course_id]
              if (!course) return null
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => setDraggingId(item.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => draggingId && reorder(draggingId, item.id)}
                  className="group relative"
                >
                  <div className="absolute left-3 top-3 rounded-full border border-dashed border-[#861F41]/30 bg-white px-2 py-1 text-xs text-muted-foreground">
                    <Move className="h-3.5 w-3.5 text-[#861F41]" />
                  </div>
                  <CourseCard course={course} muted showDescription />
                  <Card className="mt-2 flex items-center justify-between rounded-xl border border-border/80 bg-muted/60 px-3 py-2">
                    <p className="text-xs text-muted-foreground">{item.note ?? "No note"}</p>
                    <Button
                      size="sm"
                      variant={item.selected ? "default" : "outline"}
                      className={item.selected ? "bg-[#861F41] text-white hover:bg-[#6f1935]" : ""}
                      onClick={() => toggleSelect(item.id)}
                    >
                      <Rows className="mr-1 h-3.5 w-3.5" />
                      {item.selected ? "Selected" : "Select"}
                    </Button>
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
