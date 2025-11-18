import { db, tables } from "@/db"
import type { Course, RecommendationResult } from "@/lib/types"
import { computePassRate, scoreCourse } from "@/utils/scoring"

type RecommendationOpts = {
  userId?: string
  limit?: number
  pathwaysFocus?: string[]
}

export async function getEasyCourses(opts: RecommendationOpts = {}): Promise<RecommendationResult[]> {
  const limit = opts.limit ?? 15

  const { data: courses, error } = await db
    .from(tables.courses)
    .select("*")
    .limit(300)
  if (error) throw error

  const results: RecommendationResult[] = []
  for (const course of courses as Course[]) {
    const grades = await getCourseGpa(course.id)
    const passRate = computePassRate(grades)
    const avgGpa = grades.length ? average(grades.map((g) => g.avg_gpa)) : 0
    const instructorGpa = grades.length ? average(grades.filter((g) => g.instructor_id).map((g) => g.avg_gpa)) : null
    const difficulty = avgGpa >= 3.5 ? "Easy" : avgGpa >= 3.0 ? "Medium" : "Hard"
    const res = scoreCourse({
      base: 1,
      gpa: avgGpa,
      instructorGpa,
      passRate,
      pathwayHits: course.pathways ?? [],
      difficulty,
    })
    res.course_id = course.id
    results.push(res)
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit)
}

export async function getRecommendationsForUser(userId: string, limit = 15): Promise<RecommendationResult[]> {
  // Pull remaining requirements & completed courses to avoid duplicates
  const { data: remaining, error: remErr } = await db
    .from(tables.remaining)
    .select("course_options")
    .eq("user_id", userId)
  if (remErr) throw remErr

  const pool = new Set<string>()
  remaining?.forEach((r) => r.course_options?.forEach((c: string) => pool.add(c)))

  const candidates = Array.from(pool)
  if (!candidates.length) return getEasyCourses({ limit })

  const results: RecommendationResult[] = []
  for (const id of candidates) {
    const { data: course } = await db.from(tables.courses).select("*").eq("id", id).maybeSingle()
    if (!course) continue
    const grades = await getCourseGpa(id)
    const passRate = computePassRate(grades)
    const avgGpa = grades.length ? average(grades.map((g) => g.avg_gpa)) : 0
    const difficulty = avgGpa >= 3.5 ? "Easy" : avgGpa >= 3.0 ? "Medium" : "Hard"
    const res = scoreCourse({
      base: 1.5,
      gpa: avgGpa,
      instructorGpa: null,
      passRate,
      pathwayHits: (course as Course).pathways ?? [],
      difficulty,
    })
    res.course_id = id
    results.push(res)
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit)
}

export async function getPathwaysRecommendations(pathwayIds: string[], limit = 10): Promise<RecommendationResult[]> {
  const { data, error } = await db
    .from(tables.pathwaysCourses)
    .select("course_id")
    .in("pathway_id", pathwayIds)
  if (error) throw error

  const uniqueCourses = Array.from(new Set((data ?? []).map((d) => d.course_id)))
  const results: RecommendationResult[] = []
  for (const id of uniqueCourses) {
    const { data: course } = await db.from(tables.courses).select("*").eq("id", id).maybeSingle()
    if (!course) continue
    const grades = await getCourseGpa(id)
    const passRate = computePassRate(grades)
    const avgGpa = grades.length ? average(grades.map((g) => g.avg_gpa)) : 0
    const difficulty = avgGpa >= 3.5 ? "Easy" : avgGpa >= 3.0 ? "Medium" : "Hard"
    const res = scoreCourse({
      base: 1.2,
      gpa: avgGpa,
      instructorGpa: null,
      passRate,
      pathwayHits: pathwayIds,
      difficulty,
    })
    res.course_id = id
    results.push(res)
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit)
}

async function getCourseGpa(courseId: string) {
  const { data, error } = await db
    .from(tables.grades)
    .select("*")
    .eq("course_id", courseId)
    .limit(50)
  if (error) throw error
  return data ?? []
}

function average(nums: number[]): number {
  if (!nums.length) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

