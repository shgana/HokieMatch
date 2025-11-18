"use client"

import { useEffect, useState } from "react"

import { CourseComparisonBlock } from "@/components/CourseComparisonBlock"
import { Sidebar } from "@/components/Sidebar"
import { TopNav } from "@/components/TopNav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { apiPost } from "@/lib/api"
import type { Course } from "@/lib/types"

export default function ComparePage() {
  const [courseInput, setCourseInput] = useState("CS 2114, MATH 2114, STAT 4705")
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const compare = async () => {
    setLoading(true)
    setError(null)
    try {
      const ids = courseInput
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
      const res = await apiPost<{ comparison: { courses: any[] } }>("/api/compare", { courseIds: ids })
      const resultCourses = res.comparison?.courses ?? []
      setCourses(resultCourses as Course[])
    } catch (err: any) {
      setError(err.message ?? "Failed to compare courses")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    compare()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-screen gap-6">
      <Sidebar />
      <main className="flex-1 space-y-6 px-4 pb-10 lg:px-6">
        <TopNav
          title="Course Comparison"
          subtitle="Side-by-side GPA charts, difficulty scores, Pathways tags."
        />

        <Card className="space-y-3 rounded-2xl border border-border/80 bg-white/90 px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <Input
                value={courseInput}
                onChange={(e) => setCourseInput(e.target.value)}
                placeholder="Enter up to three course IDs separated by commas"
              />
              <Button onClick={compare} disabled={loading}>
                {loading ? "Comparing..." : "Compare"}
              </Button>
            </div>
            <Badge variant="secondary">{courses.length} courses</Badge>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </Card>

        <CourseComparisonBlock courses={courses as any} />
      </main>
    </div>
  )
}
