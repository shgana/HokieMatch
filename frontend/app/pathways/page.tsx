"use client"

import { useEffect, useMemo, useState } from "react"
import { Compass } from "lucide-react"

import { PathwayFilterSidebar, type PathwayFilters } from "@/components/PathwayFilterSidebar"
import { PathwaysGrid } from "@/components/PathwaysGrid"
import { Sidebar } from "@/components/Sidebar"
import { TopNav } from "@/components/TopNav"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { apiGet } from "@/lib/api"
import type { Course, PathwayArea } from "@/lib/types"

const defaultFilters: PathwayFilters = {
  categories: [],
  levels: [],
  credits: [],
  search: "",
}

export default function PathwaysPage() {
  const [filters, setFilters] = useState<PathwayFilters>(defaultFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [areas, setAreas] = useState<PathwayArea[]>([])
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [pathwayRes, coursesRes] = await Promise.all([
          apiGet<{ pathways: PathwayArea[] }>("/api/pathways"),
          apiGet<{ courses: Course[] }>("/api/courses/all"),
        ])

        // fetch course lists per pathway for grid badges
        const withCourses: PathwayArea[] = []
        for (const area of pathwayRes.pathways ?? []) {
          try {
            const res = await apiGet<{ courses: { course: Course }[] }>(
              `/api/pathways/${encodeURIComponent(area.id)}/courses`
            )
            withCourses.push({
              ...area,
              courses: (res.courses ?? []).map((c) => c.course?.id ?? c.course_id),
            })
          } catch {
            withCourses.push(area)
          }
        }

        if (!mounted) return
        setAreas(withCourses)
        setCourses(coursesRes.courses ?? [])
        setLoading(false)
      } catch (err: any) {
        if (!mounted) return
        setError(err.message ?? "Failed to load pathways")
        setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const filteredPathways = useMemo(() => {
    return areas.filter((area) => {
      const matchCategory =
        filters.categories.length === 0 || filters.categories.includes(area.category)
      const matchLevel = filters.levels.length === 0 || filters.levels.includes(area.credits_required >= 6 ? "Upper-level" : "1000/2000")
      const matchCredits =
        filters.credits.length === 0 || filters.credits.includes(area.credits_required.toString())
      const matchSearch =
        !filters.search ||
        area.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (area.courses ?? []).some((course) => course.toLowerCase().includes(filters.search.toLowerCase()))
      return matchCategory && matchLevel && matchCredits && matchSearch
    })
  }, [areas, filters])

  return (
    <div className="flex min-h-screen gap-6">
      <Sidebar />
      <main className="flex-1 space-y-6 px-4 pb-10 lg:px-6">
        <TopNav
          title="Pathways Explorer"
          subtitle="Filter areas, levels, and credits. Data pulled from backend."
        />

        {loading ? (
          <p>Loading pathways...</p>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
            <PathwayFilterSidebar values={filters} onChange={setFilters} />

            <div className="space-y-3">
              <Card className="flex items-center justify-between rounded-2xl border border-border/80 bg-white/90 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-[#861F41]" />
                  <p className="text-sm text-muted-foreground">
                    Live pathways and course mappings.
                  </p>
                </div>
                <Badge variant="secondary">{filteredPathways.length} areas</Badge>
              </Card>

              <PathwaysGrid pathways={filteredPathways} courses={courses} search={filters.search} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
