"use client"

import { useEffect, useMemo, useState } from "react"
import { Flame, Layers, Target } from "lucide-react"

import { CourseCard } from "@/components/CourseCard"
import { GPAChart } from "@/components/GPAChart"
import { ProgressCard } from "@/components/ProgressCard"
import { Sidebar } from "@/components/Sidebar"
import { TopNav } from "@/components/TopNav"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { apiGet } from "@/lib/api"
import type { Course, DarsReport, RecommendationResult } from "@/lib/types"

const DEFAULT_USER =
  process.env.NEXT_PUBLIC_DEFAULT_USER_ID || "00000000-0000-0000-0000-000000000001"

type SummaryState = {
  loading: boolean
  error?: string
  summary?: DarsReport | null
  recs?: RecommendationResult[]
  recCourses?: Course[]
}

export default function DashboardPage() {
  const [state, setState] = useState<SummaryState>({ loading: true })

  useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        const [summaryRes, recRes] = await Promise.all([
          apiGet<{ summary: DarsReport | null }>(`/api/dars/summary`, { userId: DEFAULT_USER }),
          apiGet<{ results: RecommendationResult[] }>(`/api/recommendations/for-user`, {
            userId: DEFAULT_USER,
            limit: 6,
          }),
        ])

        const recs = recRes.results || []
        const recCourses: Course[] = []
        for (const rec of recs) {
          try {
            const courseRes = await apiGet<{ course: Course }>(`/api/courses/${encodeURIComponent(rec.course_id)}`)
            recCourses.push(courseRes.course)
          } catch {
            /* ignore missing course */
          }
        }

        if (!isMounted) return
        setState({
          loading: false,
          summary: summaryRes.summary,
          recs,
          recCourses,
        })
      } catch (err: any) {
        if (!isMounted) return
        setState({ loading: false, error: err.message })
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [])

  const progress = useMemo(() => {
    const s = state.summary
    if (!s) return { completed: 0, remaining: 0, percent: 0 }
    return {
      completed: s.hours_completed ?? 0,
      remaining: s.hours_remaining ?? 0,
      percent: s.progress_percent ?? 0,
    }
  }, [state.summary])

  return (
    <div className="flex min-h-screen gap-6">
      <Sidebar />
      <main className="flex-1 space-y-6 px-4 pb-10 lg:px-6">
        <TopNav title="Dashboard" subtitle="Live Supabase-backed data." />

        {state.loading ? (
          <div className="rounded-2xl border border-border/70 bg-white/80 p-6 shadow-sm">Loading dashboard...</div>
        ) : state.error ? (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
            {state.error}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <ProgressCard
                title="Completed Hours"
                value={progress.completed}
                description="Hours applied toward degree"
                icon={<Layers className="h-4 w-4" />}
              />
              <ProgressCard
                title="Remaining Hours"
                value={progress.remaining}
                description="Requirements left to satisfy"
                icon={<Target className="h-4 w-4" />}
              />
              <ProgressCard
                title="Progress"
                value={`${progress.percent ?? 0}%`}
                description="Degree completion estimate"
                progress={Number(progress.percent ?? 0)}
              />
              <ProgressCard
                title="Easy picks"
                value={`${state.recs?.length ?? 0} courses`}
                description="From grade distributions"
                icon={<Flame className="h-4 w-4 text-[#E87722]" />}
                badge="Recommendations"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <GPAChart
                data={
                  state.summary?.parsed?.completedCourses?.map((c, idx) => ({
                    term: c.term ?? `C${idx + 1}`,
                    gpa: 3.0,
                  })) ?? []
                }
              />
              <Card className="rounded-2xl border border-border/80 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Next suggested courses</p>
                    <p className="text-sm font-semibold text-foreground">From /api/recommendations/for-user</p>
                  </div>
                  <Badge variant="secondary">Live</Badge>
                </div>
                <div className="space-y-3">
                  {state.recs && state.recs.length === 0 && (
                    <p className="text-sm text-muted-foreground">No recommendations yet.</p>
                  )}
                  {state.recs?.map((rec) => {
                    const course = state.recCourses?.find((c) => c.id === rec.course_id)
                    return (
                      <div
                        key={rec.course_id}
                        className="flex items-start justify-between rounded-xl border border-border/60 bg-muted/50 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">{rec.course_id}</p>
                          <p className="text-xs text-muted-foreground">{course?.title ?? "Course"}</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Badge variant="outline">GPA {rec.avg_gpa.toFixed(2)}</Badge>
                            <Badge variant="outline" className="border-dashed">
                              {rec.difficulty}
                            </Badge>
                          </div>
                        </div>
                        {course?.pathways?.length ? (
                          <Badge variant="secondary">Pathways {course.pathways.join(", ")}</Badge>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {state.recCourses?.map((course) => (
                <CourseCard key={course.id} course={course} muted showDescription />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
