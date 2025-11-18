"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { AlertOctagon, ArrowLeft, BookOpen, ExternalLink, ListTree } from "lucide-react"

import { CourseCard } from "@/components/CourseCard"
import { GPAChart } from "@/components/GPAChart"
import { Sidebar } from "@/components/Sidebar"
import { TopNav } from "@/components/TopNav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiGet } from "@/lib/api"
import type { Course, GradeDistribution } from "@/lib/types"

interface CourseDetailPageProps {
  params: { id: string }
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [grades, setGrades] = useState<GradeDistribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await apiGet<{ course: Course; grades: GradeDistribution[] }>(
          `/api/courses/${encodeURIComponent(params.id)}`
        )
        if (!mounted) return
        setCourse(res.course)
        setGrades(res.grades ?? [])
      } catch (err: any) {
        if (!mounted) return
        setError(err.message ?? "Failed to load course")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [params.id])

  const difficulty = (() => {
    const avgGpa = grades.length ? grades.reduce((acc, g) => acc + (Number(g.avg_gpa) || 0), 0) / grades.length : 0
    if (avgGpa >= 3.5) return "Easy"
    if (avgGpa >= 3.0) return "Medium"
    return "Hard"
  })()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading course...</p>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="flex min-h-screen items-center justify-center text-destructive">
        {error ?? "Course not found"}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen gap-6">
      <Sidebar />
      <main className="flex-1 space-y-6 px-4 pb-10 lg:px-6">
        <TopNav
          title={`${course.id} • ${course.title}`}
          subtitle="Detail view with live grade distributions."
        />

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Credits: {course.credits}</Badge>
          <Badge variant="outline">Difficulty: {difficulty}</Badge>
          {course.pathways?.length ? (
            <Badge variant="outline" className="border-dashed">
              Pathways {course.pathways.join(", ")}
            </Badge>
          ) : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr]">
          <Card className="rounded-2xl border border-border/80 bg-white/90 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Instructors & overview</CardTitle>
                <p className="text-sm text-muted-foreground">{course.description}</p>
              </div>
              <Badge variant="secondary">Sections & instructors</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(course.tags ?? []).map((tag) => (
                  <Badge key={tag} variant="outline" className="border-dashed">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4 text-[#861F41]" />
                Syllabus/instructor info placeholder
                <ExternalLink className="h-3.5 w-3.5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-white/90 p-4 shadow-sm">
            <div className="flex items-center justify-between pb-2">
              <p className="text-sm font-semibold text-foreground">Difficulty rank</p>
              <Badge
                variant={
                  difficulty === "Easy"
                    ? "success"
                    : difficulty === "Medium"
                      ? "info"
                      : "warning"
                }
              >
                {difficulty}
              </Badge>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-dashed border-[#861F41]/30 bg-muted/50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Average GPA</p>
              <p className="text-3xl font-bold text-foreground">
                {grades.length ? (
                  (grades.reduce((acc, g) => acc + (Number(g.avg_gpa) || 0), 0) / grades.length).toFixed(2)
                ) : (
                  "N/A"
                )}
              </p>
              <p className="text-xs text-muted-foreground">Based on grade distributions.</p>
              <Button className="w-fit gap-2 bg-[#861F41] text-white hover:bg-[#6f1935]">
                Add to My Picks
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-2xl border border-border/80 bg-white/90 p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3">
              <div>
                <p className="text-sm font-semibold text-foreground">GPA distribution</p>
                <p className="text-xs text-muted-foreground">Histogram from backend data.</p>
              </div>
              <Badge variant="secondary">Live</Badge>
            </div>
            <div className="h-60">
              {grades.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={grades.map((g) => ({
                      grade: g.section ?? "Section",
                      percent: g.total ? ((g.a_count + g.b_count) / g.total) * 100 : 0,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="grade" tickLine={false} />
                    <YAxis tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        borderColor: "hsl(var(--border))",
                      }}
                    />
                    <Bar dataKey="percent" fill="#861F41" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No grade data yet.</p>
              )}
            </div>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-white/90 p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3">
              <div>
                <p className="text-sm font-semibold text-foreground">GPA trend</p>
                <p className="text-xs text-muted-foreground">Line chart powered by Recharts.</p>
              </div>
              <Badge variant="secondary">Preview</Badge>
            </div>
            <GPAChart data={[]} />
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-2xl border border-border/80 bg-white/90 p-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2">
              <ListTree className="h-4 w-4 text-[#861F41]" />
              <p className="text-sm font-semibold text-foreground">Prerequisites</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(course.tags ?? []).slice(0, 3).map((prereq) => (
                <Badge key={prereq} variant="outline" className="border-dashed">
                  {prereq}
                </Badge>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertOctagon className="h-4 w-4" />
              Placeholder prerequisites — add real validation when available.
            </div>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-white/90 p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3">
              <p className="text-sm font-semibold text-foreground">Similar courses</p>
              <Badge variant="secondary">0 suggestions</Badge>
            </div>
            <div className="grid gap-3">
              <p className="text-sm text-muted-foreground">Add similarity logic when data is available.</p>
            </div>
          </Card>
        </div>

        <Button variant="ghost" className="w-fit gap-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </main>
    </div>
  )
}
