"use client"

import { useMemo } from "react"
import { BarChart3, GitCompareArrows, Target } from "lucide-react"
import { ResponsiveContainer, Area, AreaChart, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Course } from "@/lib/types"

interface CourseComparisonBlockProps {
  courses: Array<Course & { avg_gpa?: number; difficulty?: "Easy" | "Medium" | "Hard"; grade_distribution?: any[] }>
}

export function CourseComparisonBlock({ courses }: CourseComparisonBlockProps) {
  if (courses.length === 0) {
    return (
      <Card className="rounded-2xl border border-border/80 bg-white/90 p-6 shadow-sm">
        <CardTitle className="text-lg">No courses selected</CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">Pick up to three courses to compare GPA trends.</p>
      </Card>
    )
  }

  const chartData = useMemo(() => {
    return courses.map((course, idx) => ({
      term: course.code ?? course.id,
      [course.code ?? course.id]: course["avg_gpa"] ?? course.gpa ?? 0,
    }))
  }, [courses])

  return (
    <Card className="rounded-2xl border border-border/80 bg-white/90 shadow-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <GitCompareArrows className="h-5 w-5 text-[#861F41]" />
          <div>
            <CardTitle className="text-xl">Course Comparison</CardTitle>
            <p className="text-sm text-muted-foreground">
              GPA trend, difficulty snapshots, and Pathways alignment.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {courses.map((course) => (
            <Badge key={course.id} variant="outline" className="border-dashed">
              {course.code} ({course.difficulty})
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-64 w-full rounded-xl border border-border/70 bg-muted/60 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="term" tickLine={false} />
              <YAxis domain={[2.5, 4.0]} tickCount={4} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  borderColor: "hsl(var(--border))",
                }}
              />
              {courses.map((course, idx) => (
                <Area
                  key={course.id}
                  type="monotone"
                  dataKey={course.code}
                  fill={idx === 0 ? "rgba(134, 31, 65, 0.18)" : idx === 1 ? "rgba(232, 119, 34, 0.18)" : "rgba(56, 189, 248, 0.18)"}
                  stroke={idx === 0 ? "#861F41" : idx === 1 ? "#E87722" : "#38bdf8"}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/50 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{course.code}</p>
                  <p className="text-sm font-semibold text-foreground">{course.title}</p>
                </div>
                <Badge
                  variant={
                    course.difficulty === "Easy"
                      ? "success"
                      : course.difficulty === "Medium"
                        ? "info"
                        : "warning"
                  }
                >
                  {course.difficulty}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4 text-[#E87722]" />
                Avg GPA {course.gpa.toFixed(2)}
              </div>
              <div className="flex flex-wrap gap-2">
                {course.pathways.map((pathway) => (
                  <Badge key={pathway} variant="outline">
                    Pathways {pathway}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-xs text-muted-foreground">
                <Target className="h-4 w-4 text-[#861F41]" />
                {course.tags.slice(0, 2).join(" • ")}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
